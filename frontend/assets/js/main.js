const btnMenu = document.querySelector("#btn-sidebar");
const sidebar = document.querySelector(".sidebar");

btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("aberto");
});


const dataInicial = document.querySelector("#dataInicial");
const dataFinal = document.querySelector("#dataFinal");
const btnFiltro = document.querySelector("#btnPesquisar");

const resultado = document.querySelector("#resultado");

btnFiltro.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!dataInicial.value || !dataFinal.value) {
    await Swal.fire({
      icon: "warning",
      title: "Datas obrigatórias",
      text: "Informe a data inicial e final.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  try {
    const respostaFiltro = await fetch(
      "http://localhost:8000/filtrarData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          datainicial: dataInicial.value,
          datafinal: dataFinal.value,
        }),
      }
    );

    const dados = await respostaFiltro.json();

    if (!respostaFiltro.ok) {
      await Swal.fire({
        icon: "error",
        title: "Erro",
        text: dados.detail || "Erro ao consultar movimentações.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    if (dados.length === 0) {
      resultado.innerHTML = "";

      await Swal.fire({
        icon: "info",
        title: "Nenhum resultado",
        text: "Não foram encontradas movimentações para o período informado.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    atualizarTabela(dados);
  } catch (erro) {
    console.error(erro);

    await Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Não foi possível conectar ao servidor.",
      confirmButtonColor: "#1e3a8a",
    });
  }
});

function atualizarTabela(movimentacoes) {
  resultado.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        ${movimentacoes
          .map(
            (item) => `
              <tr>
                <td>${item.data}</td>
                <td>${item.descricao}</td>
                <td>
                  ${Number(item.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}