import os
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()
jwt = JWTManager()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tickets = db.relationship("Ticket", backref="owner", lazy=True, cascade="all, delete-orphan")
    comments = db.relationship("Comment", backref="author", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(140), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), default="medium", nullable=False)
    status = db.Column(db.String(20), default="open", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    comments = db.relationship("Comment", backref="ticket", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_comments=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_id": self.user_id,
            "owner_name": self.owner.name if self.owner else None,
        }
        if include_comments:
            data["comments"] = [c.to_dict() for c in sorted(self.comments, key=lambda x: x.created_at)]
        return data


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey("ticket.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "body": self.body,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
            "author_name": self.author.name if self.author else None,
            "ticket_id": self.ticket_id,
        }


def validate_email(email):
    return isinstance(email, str) and "@" in email and "." in email.split("@")[-1]


def ticket_errors(data, partial=False):
    errors = {}
    required = ["title", "description", "category", "priority"]
    if not partial:
        for field in required:
            if not str(data.get(field, "")).strip():
                errors[field] = f"{field.capitalize()} is required."
    if "title" in data and len(str(data.get("title", "")).strip()) < 4:
        errors["title"] = "Title must be at least 4 characters."
    if "description" in data and len(str(data.get("description", "")).strip()) < 10:
        errors["description"] = "Description must be at least 10 characters."
    if "priority" in data and data.get("priority") not in {"low", "medium", "high"}:
        errors["priority"] = "Priority must be low, medium, or high."
    if "status" in data and data.get("status") not in {"open", "in-progress", "resolved"}:
        errors["status"] = "Invalid status."
    return errors


def create_app(test_config=None):
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL", "sqlite:///issueflow.db")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "dev-change-me"),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1),
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "*")}})

    with app.app_context():
        db.create_all()
        admin_email = os.getenv("ADMIN_EMAIL", "admin@issueflow.com").lower()
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")
        if not User.query.filter_by(email=admin_email).first():
            admin = User(
                name="IssueFlow Admin",
                email=admin_email,
                password_hash=generate_password_hash(admin_password),
                role="admin",
            )
            db.session.add(admin)
            db.session.commit()

    def current_user():
        identity = get_jwt_identity()
        return db.session.get(User, int(identity)) if identity else None

    def admin_only(user):
        return bool(user and user.role == "admin")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/api/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        errors = {}
        if len(name) < 2:
            errors["name"] = "Name must be at least 2 characters."
        if not validate_email(email):
            errors["email"] = "Enter a valid email address."
        if len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."
        if User.query.filter_by(email=email).first():
            errors["email"] = "An account with this email already exists."
        if errors:
            return jsonify({"errors": errors}), 400

        user = User(name=name, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": user.to_dict()}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Invalid email or password."}), 401
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": user.to_dict()})

    @app.get("/api/auth/me")
    @jwt_required()
    def me():
        user = current_user()
        if not user:
            return jsonify({"message": "User not found."}), 404
        return jsonify(user.to_dict())

    @app.put("/api/auth/profile")
    @jwt_required()
    def update_profile():
        user = current_user()
        data = request.get_json(silent=True) or {}
        name = str(data.get("name", "")).strip()
        if len(name) < 2:
            return jsonify({"errors": {"name": "Name must be at least 2 characters."}}), 400
        user.name = name
        db.session.commit()
        return jsonify(user.to_dict())

    @app.get("/api/tickets")
    @jwt_required()
    def list_tickets():
        user = current_user()
        query = Ticket.query
        if not admin_only(user):
            query = query.filter_by(user_id=user.id)

        search = request.args.get("search", "").strip()
        status = request.args.get("status", "").strip()
        priority = request.args.get("priority", "").strip()
        category = request.args.get("category", "").strip()
        if search:
            query = query.filter(Ticket.title.ilike(f"%{search}%"))
        if status:
            query = query.filter_by(status=status)
        if priority:
            query = query.filter_by(priority=priority)
        if category:
            query = query.filter_by(category=category)

        tickets = query.order_by(Ticket.created_at.desc()).all()
        return jsonify([t.to_dict() for t in tickets])

    @app.post("/api/tickets")
    @jwt_required()
    def create_ticket():
        user = current_user()
        data = request.get_json(silent=True) or {}
        errors = ticket_errors(data)
        if errors:
            return jsonify({"errors": errors}), 400
        ticket = Ticket(
            title=data["title"].strip(),
            description=data["description"].strip(),
            category=data["category"].strip(),
            priority=data["priority"],
            status="open",
            user_id=user.id,
        )
        db.session.add(ticket)
        db.session.commit()
        return jsonify(ticket.to_dict()), 201

    @app.get("/api/tickets/<int:ticket_id>")
    @jwt_required()
    def get_ticket(ticket_id):
        user = current_user()
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found."}), 404
        if ticket.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        return jsonify(ticket.to_dict(include_comments=True))

    @app.put("/api/tickets/<int:ticket_id>")
    @jwt_required()
    def update_ticket(ticket_id):
        user = current_user()
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found."}), 404
        if ticket.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        data = request.get_json(silent=True) or {}
        if not admin_only(user):
            data.pop("status", None)
        errors = ticket_errors(data, partial=True)
        if errors:
            return jsonify({"errors": errors}), 400
        for field in ["title", "description", "category", "priority", "status"]:
            if field in data:
                setattr(ticket, field, data[field].strip() if isinstance(data[field], str) else data[field])
        ticket.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.session.commit()
        return jsonify(ticket.to_dict())

    @app.delete("/api/tickets/<int:ticket_id>")
    @jwt_required()
    def delete_ticket(ticket_id):
        user = current_user()
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found."}), 404
        if ticket.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({"message": "Ticket deleted."})

    @app.post("/api/tickets/<int:ticket_id>/comments")
    @jwt_required()
    def add_comment(ticket_id):
        user = current_user()
        ticket = db.session.get(Ticket, ticket_id)
        if not ticket:
            return jsonify({"message": "Ticket not found."}), 404
        if ticket.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        body = str((request.get_json(silent=True) or {}).get("body", "")).strip()
        if len(body) < 2:
            return jsonify({"errors": {"body": "Comment must be at least 2 characters."}}), 400
        comment = Comment(body=body, user_id=user.id, ticket_id=ticket.id)
        db.session.add(comment)
        db.session.commit()
        return jsonify(comment.to_dict()), 201

    @app.put("/api/comments/<int:comment_id>")
    @jwt_required()
    def update_comment(comment_id):
        user = current_user()
        comment = db.session.get(Comment, comment_id)
        if not comment:
            return jsonify({"message": "Comment not found."}), 404
        if comment.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        body = str((request.get_json(silent=True) or {}).get("body", "")).strip()
        if len(body) < 2:
            return jsonify({"errors": {"body": "Comment must be at least 2 characters."}}), 400
        comment.body = body
        db.session.commit()
        return jsonify(comment.to_dict())

    @app.delete("/api/comments/<int:comment_id>")
    @jwt_required()
    def delete_comment(comment_id):
        user = current_user()
        comment = db.session.get(Comment, comment_id)
        if not comment:
            return jsonify({"message": "Comment not found."}), 404
        if comment.user_id != user.id and not admin_only(user):
            return jsonify({"message": "Forbidden."}), 403
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"message": "Comment deleted."})

    @app.get("/api/dashboard")
    @jwt_required()
    def dashboard():
        user = current_user()
        query = Ticket.query if admin_only(user) else Ticket.query.filter_by(user_id=user.id)
        tickets = query.all()
        by_status = {key: 0 for key in ["open", "in-progress", "resolved"]}
        by_priority = {key: 0 for key in ["low", "medium", "high"]}
        for ticket in tickets:
            by_status[ticket.status] = by_status.get(ticket.status, 0) + 1
            by_priority[ticket.priority] = by_priority.get(ticket.priority, 0) + 1
        return jsonify({
            "total": len(tickets),
            "by_status": by_status,
            "by_priority": by_priority,
            "recent": [t.to_dict() for t in sorted(tickets, key=lambda x: x.created_at, reverse=True)[:5]],
        })

    @app.get("/api/admin/users")
    @jwt_required()
    def admin_users():
        user = current_user()
        if not admin_only(user):
            return jsonify({"message": "Admin access required."}), 403
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users])

    @app.put("/api/admin/users/<int:user_id>/role")
    @jwt_required()
    def update_role(user_id):
        user = current_user()
        if not admin_only(user):
            return jsonify({"message": "Admin access required."}), 403
        target = db.session.get(User, user_id)
        if not target:
            return jsonify({"message": "User not found."}), 404
        role = (request.get_json(silent=True) or {}).get("role")
        if role not in {"user", "admin"}:
            return jsonify({"message": "Invalid role."}), 400
        if target.id == user.id and role != "admin":
            return jsonify({"message": "You cannot remove your own admin role."}), 400
        target.role = role
        db.session.commit()
        return jsonify(target.to_dict())

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"message": "Route not found."}), 404

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
