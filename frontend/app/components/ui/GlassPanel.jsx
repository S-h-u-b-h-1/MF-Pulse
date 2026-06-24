export default function GlassPanel({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag className={`glass ${className}`} {...props}>
      {children}
    </Tag>
  );
}
