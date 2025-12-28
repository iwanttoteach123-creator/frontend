import React, { useState } from "react";
import axios from "axios";
import { url_backend } from '../Config';
const GeneradorPreguntas = ({ assistantId }) => {
    const [vf, setVf] = useState(0);
    const [desarrollo, setDesarrollo] = useState(0);
    const [alternativas, setAlternativas] = useState(0);
    const [dificultad, setDificultad] = useState("intermedio");
    const [preguntasGeneradas, setPreguntasGeneradas] = useState("");

    const generarPreguntas = async () => {
        try {
            const response = await axios.post(`${url_backend}/generar-preguntas/${assistantId}`, {
                vf,
                desarrollo,
                alternativas,
                dificultad
            });
            setPreguntasGeneradas(response.data.preguntas);
        } catch (error) {
            console.error("Error generando preguntas:", error);
            setPreguntasGeneradas("Error al generar preguntas.");
        }
    };

    return (
        <div style={{ padding: "1.5rem", backgroundColor: "#1B1F38", borderRadius: "10px", color: "#FFF", marginTop: "1rem" }}>
            <h2>Generador de Preguntas</h2>

            <label>Cantidad de Preguntas de Verdadero/Falso:</label>
            <input type="number" value={vf} onChange={(e) => setVf(e.target.value)} min="0" />

            <label>Cantidad de Preguntas de Desarrollo:</label>
            <input type="number" value={desarrollo} onChange={(e) => setDesarrollo(e.target.value)} min="0" />

            <label>Cantidad de Preguntas de Alternativas:</label>
            <input type="number" value={alternativas} onChange={(e) => setAlternativas(e.target.value)} min="0" />

            <label>Dificultad:</label>
            <select value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                <option value="fácil">Fácil</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
            </select>

            <button onClick={generarPreguntas} style={{ marginTop: "1rem", backgroundColor: "#6C63FF", color: "#FFF", padding: "0.5rem 1rem", borderRadius: "5px" }}>
                Generar Preguntas
            </button>

            {preguntasGeneradas && (
                <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#2C2F48", borderRadius: "5px" }}>
                    <h3>Preguntas Generadas:</h3>
                    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{preguntasGeneradas}</pre>
                </div>
            )}
        </div>
    );
};

export default GeneradorPreguntas;
