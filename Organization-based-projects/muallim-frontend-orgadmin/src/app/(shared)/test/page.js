"use client";
import React from "react";
import Papa from "papaparse";

function page() {
  const [rows, setRows] = React.useState([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    id: "",
    Person: "",
    Age: "",
    Score: "",
    Department: "",
    Class: "",
  });
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("CSV parse results:", results);
          const normalized = (results.data || []).map((row, index) => ({
            id: row.id ?? row.ID ?? row.Id ?? `${index + 1}`,
            Person: row.Person ?? row.Name ?? row.person ?? "",
            Age: row.Age ?? row.age ?? "",
            Score: row.Score ?? row.score ?? "",
            Department:
              row.Department ?? row.department ?? row.Dept ?? row.dept ?? "",
            Class: row.Class ?? row.class ?? "",
          }));
          setRows(normalized);
        },
        error: (error) => {
          console.error("CSV parse error:", error);
        },
      });
      return;
    }

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      try {
        const XLSX = await import("xlsx");
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
            console.log("XLSX parse results:", {
              sheetName: firstSheetName,
              rows: json,
            });
            const normalized = (json || []).map((row, index) => ({
              id: row.id ?? row.ID ?? row.Id ?? `${index + 1}`,
              Person: row.Person ?? row.Name ?? row.person ?? "",
              Age: row.Age ?? row.age ?? "",
              Score: row.Score ?? row.score ?? "",
              Department:
                row.Department ?? row.department ?? row.Dept ?? row.dept ?? "",
              Class: row.Class ?? row.class ?? "",
            }));
            setRows(normalized);
          } catch (err) {
            console.error("XLSX parse error:", err);
          }
        };
        reader.onerror = (err) => {
          console.error("File read error:", err);
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error(
          "XLSX library not available. Install 'xlsx' package to parse Excel files.",
          err
        );
      }
      return;
    }

    console.warn(
      "Unsupported file type. Please upload a .csv, .xlsx, or .xls file."
    );
  };

  const handleDelete = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const openEdit = (index) => {
    const row = rows[index];
    setEditIndex(index);
    setEditForm({
      id: row?.id ?? "",
      Person: row?.Person ?? "",
      Age: row?.Age ?? "",
      Score: row?.Score ?? "",
      Department: row?.Department ?? "",
      Class: row?.Class ?? "",
    });
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    setRows((prev) =>
      prev.map((r, i) => (i === editIndex ? { ...editForm } : r))
    );
    closeEdit();
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Test</h1>
      <input
        type="file"
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={handleFileChange}
      />
      <p style={{ marginTop: 8 }}>
        Upload a CSV or XLSX file. Parsed data is shown below.
      </p>

      {rows.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  id
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Person
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Age
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Score
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Class
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.id}-${index}`}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.id}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.Person}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.Age}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.Score}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.Department}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {row.Class}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <button
                      onClick={() => openEdit(index)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{ color: "#b00" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              width: 400,
              maxWidth: "100%",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Edit Row</h3>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
            >
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>id</div>
                <input
                  name="id"
                  value={editForm.id}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Person</div>
                <input
                  name="Person"
                  value={editForm.Person}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Age</div>
                <input
                  name="Age"
                  value={editForm.Age}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Score</div>
                <input
                  name="Score"
                  value={editForm.Score}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Department</div>
                <input
                  name="Department"
                  value={editForm.Department}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
              <label>
                <div style={{ fontSize: 12, marginBottom: 4 }}>Class</div>
                <input
                  name="Class"
                  value={editForm.Class}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </label>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button onClick={closeEdit} style={{ marginRight: 8 }}>
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  background: "#0a7",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: 4,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default page;
