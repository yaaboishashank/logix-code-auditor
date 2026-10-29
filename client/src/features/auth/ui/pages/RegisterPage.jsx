import { Link } from "react-router";
import RegisterForm from "../components/RegisterForm";


const RegisterPage = () => (
  <>
    <h2 id="auth-title">Start with clarity.</h2>
    <p className="auth-description">Create your LOGIX account.</p>

    <RegisterForm />

    <p className="auth-switch">
      Already have an account? <Link to="/login">Log in</Link>
    </p>
  </>
);

export default RegisterPage;