export default function About() {
  return (
    <div style={{ padding: "16px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, margin: "0 0 16px" }}>
        About this project
      </h1>

      <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#333", marginBottom: "12px" }}>
        This site is an educational project exploring how AI can help
        summarize news from public RSS feeds. It is not a professional
        news outlet and is not affiliated with any of the sources it
        summarizes.
      </p>

      <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#333", marginBottom: "12px" }}>
        Every article shown here is rewritten by an AI model from a short
        RSS summary, not the full original article. Each rewrite names
        its source and links back to it, since the original reporting
        belongs to the publisher, not to this site.
      </p>

      <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#333" }}>
        For the full story, always follow the source link included at
        the end of each article.
      </p>
    </div>
  );
}
