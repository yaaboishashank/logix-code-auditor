const Button = ({
  children,
  className = "",
  type = "button",
  ...props
}) => (
  <button type={type} className={`ui-button ${className}`} {...props}>
    {children}
  </button>
);

export default Button;