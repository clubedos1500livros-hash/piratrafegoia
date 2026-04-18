export default function TesteSimples() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🔥 TESTE SIMPLES</h1>

      <button
        onClick={() => {
          localStorage.setItem("teste", "ok");
          alert("SALVOU");
        }}
      >
        Testar salvar
      </button>
    </div>
  );
}