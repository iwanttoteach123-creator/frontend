import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { url_backend } from '../Config';
const ResponderEvaluacion = () => {
    const { evaluacionId } = useParams(); // Toma el ID de la evaluación desde la URL
    const [preguntas, setPreguntas] = useState(null);
    const [respuestas, setRespuestas] = useState({ desarrollo: {}, vf: {}, alternativas: {} });
    const [resultado, setResultado] = useState(null);
    const [dificultad, setDificultad] = useState(""); // Nivel actual
    const [sugerencia, setSugerencia] = useState(""); // Nivel sugerido
    const [porcentaje, setPorcentaje] = useState(0); // Porcentaje de aciertos

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPreguntas = async () => {
            try {
                const response = await axios.get(`${url_backend}/evaluaciones/${evaluacionId}/preguntas`);
                console.log("Preguntas recibidas:", response.data);
                setPreguntas(response.data);
                setDificultad(response.data.nivel); // Nivel de dificultad actual
            } catch (error) {
                console.error("Error al obtener las preguntas:", error);
            }
        };
        fetchPreguntas();
    }, [evaluacionId]);

    const enviarRespuestas = async () => {
        try {
            const response = await axios.post(`${url_backend}/evaluaciones/${evaluacionId}/evaluar`, {
                respuestas,
            });
            const { porcentaje_correctas, sugerencia, mensaje } = response.data;
            setResultado(mensaje);
            setPorcentaje(porcentaje_correctas);
            setSugerencia(sugerencia);
        } catch (error) {
            console.error("Error al enviar las respuestas:", error);
        }
    };

    const handleVolver = () => {
        navigate(-1);
    };

    return (
        <div
            style={{
                maxWidth: "800px",
                margin: "2rem auto",
                padding: "2rem",
                backgroundColor: "#1B1F38", // Fondo oscuro
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", // Sombras suaves
                color: "#FFFFFF",
            }}
        >
            <button
                className="btn btn-primary mb-3"
                onClick={handleVolver}
                style={{
                    backgroundColor: "#6C63FF", // Púrpura
                    borderColor: "#6C63FF",
                    padding: "0.5rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderRadius: "5px",
                }}
            >
                <i className="fas fa-arrow-left"></i> Volver
            </button>
            <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#FFFFFF" }}>
                Responder Evaluación
            </h2>
            {dificultad && (
                <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#00C8FF" }}>
                    Nivel de Dificultad: {dificultad}
                </p>
            )}
            {preguntas ? (
                <div>
                    {/* Preguntas de desarrollo */}
                    {preguntas.desarrollo.length > 0 ? (
                        preguntas.desarrollo.map((pregunta) => (
                            <div key={pregunta.id} className="mb-4">
                                <p style={{ color: "#FFFFFF" }}>{pregunta.enunciado}</p>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{
                                        maxWidth: "100%",
                                        backgroundColor: "#2C2F48", // Fondo intermedio
                                        color: "#FFFFFF",
                                        border: "1px solid #6C63FF", // Borde púrpura
                                        borderRadius: "5px",
                                    }}
                                    onChange={(e) =>
                                        setRespuestas((prev) => ({
                                            ...prev,
                                            desarrollo: { ...prev.desarrollo, [pregunta.id]: e.target.value },
                                        }))
                                    }
                                />
                            </div>
                        ))
                    ) : (
                        <p>No hay preguntas de desarrollo disponibles.</p>
                    )}

                    {/* Preguntas de verdadero/falso */}
                    {preguntas.vf.length > 0 ? (
                        preguntas.vf.map((pregunta) => (
                            <div key={pregunta.id} className="mb-4">
                                <p style={{ color: "#FFFFFF" }}>{pregunta.enunciado}</p>
                                <select
                                    className="form-control"
                                    style={{
                                        maxWidth: "100%",
                                        backgroundColor: "#2C2F48", // Fondo intermedio
                                        color: "#FFFFFF",
                                        border: "1px solid #6C63FF",
                                        borderRadius: "5px",
                                        marginBottom: "1rem",
                                    }}
                                    onChange={(e) =>
                                        setRespuestas((prev) => ({
                                            ...prev,
                                            vf: { ...prev.vf, [pregunta.id]: e.target.value },
                                        }))
                                    }
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="verdadero">Verdadero</option>
                                    <option value="falso">Falso</option>
                                </select>
                            </div>
                        ))
                    ) : (
                        <p>No hay preguntas de verdadero/falso disponibles.</p>
                    )}

                    {/* Preguntas de alternativas */}
                    {preguntas.alternativas.length > 0 ? (
                        preguntas.alternativas.map((pregunta) => (
                            <div key={pregunta.id} className="mb-4">
                                <p style={{ color: "#FFFFFF" }}>{pregunta.enunciado}</p>
                                {[pregunta.respuesta_a, pregunta.respuesta_b, pregunta.respuesta_c, pregunta.respuesta_d, pregunta.respuesta_e]
                                    .filter(Boolean)
                                    .map((opcion, index) => (
                                        <div key={index} style={{ marginBottom: "0.5rem" }}>
                                            <input
                                                type="radio"
                                                name={`alternativa-${pregunta.id}`}
                                                value={opcion}
                                                onChange={(e) =>
                                                    setRespuestas((prev) => ({
                                                        ...prev,
                                                        alternativas: {
                                                            ...prev.alternativas,
                                                            [pregunta.id]: e.target.value,
                                                        },
                                                    }))
                                                }
                                            />{" "}
                                            <span style={{ color: "#FFFFFF" }}>{opcion}</span>
                                        </div>
                                    ))}
                            </div>
                        ))
                    ) : (
                        <p>No hay preguntas de alternativas disponibles.</p>
                    )}

                    <button
                        className="btn btn-success mt-3"
                        onClick={enviarRespuestas}
                        style={{
                            backgroundColor: "#00C8FF", // Azul claro
                            borderColor: "#00C8FF",
                            padding: "0.75rem 2rem",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "#FFFFFF",
                            borderRadius: "5px",
                        }}
                    >
                        Enviar Respuestas
                    </button>

                    {resultado && (
                        <div
                            className="alert alert-info mt-3"
                            style={{
                                maxWidth: "100%",
                                margin: "2rem auto",
                                backgroundColor: "#6C63FF",
                                color: "#FFFFFF",
                                textAlign: "center",
                                padding: "1rem",
                                borderRadius: "8px",
                            }}
                        >
                            <p>
                                Evaluación completada: {porcentaje ? `${porcentaje}% correctas.` : "0% correctas."}
                            </p>
                            <p>Sugerencia: {sugerencia}</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                                <button
                                    onClick={handleVolver}
                                    className="btn btn-secondary"
                                    style={{
                                        backgroundColor: "#282C34", // Fondo gris oscuro
                                        color: "#FFFFFF",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "5px",
                                    }}
                                >
                                    Generar Manual
                                </button>
                                <button
                                    onClick={() => alert("Función en construcción")}
                                    className="btn btn-primary"
                                    style={{
                                        backgroundColor: "#1B98E0", // Azul más suave
                                        color: "#FFFFFF",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "5px",
                                    }}
                                >
                                    Generar Nueva Evaluación Automáticamente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>Cargando preguntas...</p>
            )}
        </div>
    );
};

export default ResponderEvaluacion;
