import { Link } from "react-router";
import LoginForm from "../components/LoginForm";


const LoginPage = () => (
  <>
    <h2 id="auth-title">Welcome back.</h2>
    <p className="auth-description">Log in to your LOGIX workspace.</p>

    <LoginForm />

    <p className="auth-switch">
      New to LOGIX? <Link to="/register">Create an account</Link>
    </p>
  </>
);

export default LoginPage;