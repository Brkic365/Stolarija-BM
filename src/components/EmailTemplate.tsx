import * as React from "react";

interface EmailTemplateProps {
  product: string;
  price: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  address: string;
  message: string;
  configuration?: Record<string, string>;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  product,
  price,
  firstName,
  lastName,
  email,
  telephone,
  address,
  message,
  configuration,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#f9fafb",
      color: "#333",
    }}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{ color: "#111827", marginTop: 0, borderBottom: "1px solid #e5e7eb", paddingBottom: "15px" }}
      >
        Nova narudžba
      </h2>

      <p style={{ fontSize: "16px", color: "#4b5563" }}>
        Zaprimljena je nova narudžba od <strong>{firstName} {lastName}</strong>.
      </p>

      <div style={{ marginTop: "25px", marginBottom: "25px" }}>
        <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "15px" }}>Detalji narudžbe</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", color: "#6b7280", width: "140px" }}>Proizvod:</td>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#111827" }}>{product}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#6b7280" }}>Cijena (početna):</td>
              <td style={{ padding: "8px 0", fontWeight: "bold", color: "#111827" }}>€{price.toLocaleString("en-US")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {configuration && Object.keys(configuration).length > 0 && (
        <div style={{ marginTop: "25px", marginBottom: "25px", backgroundColor: "#f3f4f6", padding: "15px", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#374151" }}>Odabrana Konfiguracija</h4>
          <ul style={{ paddingLeft: "0", listStyle: "none", margin: 0 }}>
            {Object.entries(configuration).map(([key, value]) => (
              <li key={key} style={{ padding: "4px 0", fontSize: "14px" }}>
                <span style={{ color: "#6b7280" }}>{key}:</span> <span style={{ fontWeight: 600, color: "#1f2937" }}>{value as string}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "25px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
        <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "15px" }}>Podaci o kupcu</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", color: "#6b7280", width: "140px" }}>Ime i prezime:</td>
              <td style={{ padding: "6px 0", color: "#111827" }}>{firstName} {lastName}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", color: "#6b7280" }}>Email:</td>
              <td style={{ padding: "6px 0", color: "#111827" }}>
                <a href={`mailto:${email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{email}</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", color: "#6b7280" }}>Telefon:</td>
              <td style={{ padding: "6px 0", color: "#111827" }}>
                <a href={`tel:${telephone}`} style={{ color: "#2563eb", textDecoration: "none" }}>{telephone}</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", color: "#6b7280" }}>Adresa:</td>
              <td style={{ padding: "6px 0", color: "#111827" }}>{address}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && (
        <div style={{ marginTop: "25px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
          <h3 style={{ color: "#1f2937", fontSize: "18px", marginBottom: "10px" }}>Dodatne informacije / Poruka</h3>
          <p style={{ backgroundColor: "#fffbeb", padding: "15px", borderRadius: "6px", color: "#78350f", whiteSpace: "pre-wrap", border: "1px solid #fcd34d" }}>
            {message}
          </p>
        </div>
      )}

      <div style={{ marginTop: "30px", fontSize: "12px", color: "#9ca3af", textAlign: "center", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
        <p>Ovo je automatska poruka generirana putem Stolarija BM web stranice.</p>
      </div>
    </div>
  </div>
);
