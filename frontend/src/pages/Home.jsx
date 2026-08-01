import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ArticleCard from "../components/ArticleCard";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        const q = query(
          collection(db, "articles"),
          orderBy("created_at", "desc"),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            rewritten: data.rewritten,
            link: data.link,
            createdAt: data.created_at ? data.created_at.toDate() : null,
          };
        });
        setArticles(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  return (
    <div style={{ padding: "12px", maxWidth: "600px", margin: "0 auto" }}>
      {loading && (
        <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
          Loading articles...
        </p>
      )}

      {error && (
        <p style={{ textAlign: "center", color: "#c0392b", padding: "40px 0" }}>
          Couldn't load articles: {error}
        </p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>
          No articles yet. Check back soon.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
