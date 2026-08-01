import { Link } from "react-router-dom";

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// First sentence or two of the rewritten text, for the card preview.
// Full text (including the trailing "Source: ..." line) shows on detail page.
function previewText(rewritten, maxLength = 160) {
  if (!rewritten) return "";
  if (rewritten.length <= maxLength) return rewritten;
  return rewritten.slice(0, maxLength).trim() + "...";
}

export default function ArticleCard({ article }) {
  return (
    <Link
      to={`/article/${article.id}`}
      style={{
        display: "block",
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        padding: "14px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <p style={{ fontSize: "15px", fontWeight: 500, margin: "0 0 6px", lineHeight: 1.4 }}>
        {article.title}
      </p>
      <p style={{ fontSize: "13px", color: "#666", margin: "0 0 6px", lineHeight: 1.5 }}>
        {previewText(article.rewritten)}
      </p>
      <span style={{ fontSize: "12px", color: "#999" }}>
        {timeAgo(article.createdAt)}
      </span>
    </Link>
  );
}
