import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import Register from '../pages/Register'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../api', () => ({ default: { get: vi.fn(() => Promise.reject(new Error('no token'))), post: vi.fn() } }))

function wrap(ui){return render(<MemoryRouter><AuthProvider>{ui}</AuthProvider></MemoryRouter>)}

describe('IssueFlow UI',()=>{
 it('renders the home headline',()=>{wrap(<Home/>);expect(screen.getByText(/Turn everyday issues/i)).toBeInTheDocument()})
 it('renders registration fields',()=>{wrap(<Register/>);expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument();expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()})
 it('shows validation for short name',async()=>{wrap(<Register/>);await userEvent.type(screen.getByLabelText(/Full name/i),'A');await userEvent.type(screen.getByLabelText(/Email/i),'test@example.com');await userEvent.type(screen.getByLabelText(/Password/i),'Password123!');await userEvent.click(screen.getByRole('button',{name:/Create account/i}));expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()})
 it('shows validation for invalid email',async()=>{wrap(<Register/>);await userEvent.type(screen.getByLabelText(/Full name/i),'Test User');await userEvent.type(screen.getByLabelText(/Email/i),'bademail');await userEvent.type(screen.getByLabelText(/Password/i),'Password123!');await userEvent.click(screen.getByRole('button',{name:/Create account/i}));expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument()})
 it('shows validation for short password',async()=>{wrap(<Register/>);await userEvent.type(screen.getByLabelText(/Full name/i),'Test User');await userEvent.type(screen.getByLabelText(/Email/i),'test@example.com');await userEvent.type(screen.getByLabelText(/Password/i),'123');await userEvent.click(screen.getByRole('button',{name:/Create account/i}));expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument()})
})
