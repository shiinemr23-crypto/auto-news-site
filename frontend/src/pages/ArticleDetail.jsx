import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle(docSnap.data());
        } else {
          setError("Article not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
      <Link to="/" style={{ fontSize: "14px", color: "#666", textDecoration: "none" }}>
        &larr; Back
      </Link>

      {loading && (
        <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
          Loading...
        </p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "#c0392b", padding: "40px 0" }}>
          {error}
        </p>
      )}

      {article && (
        <article style={{ marginTop: "16px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 500, lineHeight: 1.4, margin: "0 0 16px" }}>
            {article.title}
          </h1>
          <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap" }}>
            {article.rewritten}
          </p>
        </article>
      )}
    </div>
  );
}
