//SIDEBAR
const btnMenu = document.querySelector("#btn-sidebar");
const sidebar = document.querySelector(".sidebar");

btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("aberto");
});

const dataInicial = document.querySelector("#dataInicial");
const dataFinal = document.querySelector("#dataFinal");
const btnFiltro = document.querySelector("#btnPesquisar");
const resultado = document.querySelector("#resultado");

//Retorno das Movimentacoes
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
    const url = `http://localhost:8000/read_transactions?first_date=${dataInicial.value}&last_date=${dataFinal.value}`;

    const respostaFiltro = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dados = await respostaFiltro.json();

    if (!respostaFiltro.ok) {
      if (respostaFiltro.status === 404) {
        resultado.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">Nenhuma movimentação encontrada para este período.</p>`;
      }

      await Swal.fire({
        icon: "info",
        title: "Aviso",
        text: dados.detail || "Erro ao consultar movimentações.",
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
  if (!movimentacoes || movimentacoes.length === 0) {
    resultado.innerHTML = `<p style="text-align: center; color: #666; padding: 20px;">Nenhuma movimentação encontrada para este período.</p>`;
    return;
  }

  resultado.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Tipo</th>
          <th>Tag</th>
          <th>Valor</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${movimentacoes
          .map((item) => {
            const tipoClass =
              item.type === "Entrada" ? "tipo-entrada" : "tipo-saida";
            return `
                <tr>
                  <td>${formatarData(item.date)}</td>
                  <td><span class="${tipoClass}">${item.type}</span></td>
                  <td>${item.tag}</td>
                  <td>
                    ${Number(item.value).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td>
                    <button class="btnExcluirMov" data-id="${item.id}">Excluir</button>
                    <button class="btnAlterarMov" data-id="${item.id}">Alterar</button>
                  </td>
                </tr>
              `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  atualizarCards(movimentacoes);
  criarGraficos(movimentacoes);
}

function formatarData(dataString) {
  const data = new Date(dataString + "T00:00:00");
  return data.toLocaleDateString("pt-BR");
}

//Modal de inclusao
const modalInclusao = document.querySelector("#modalInclusao");
const openModalInclusaoBtn = document.querySelector("#btnIncluirMov");
const closeModalInclusaoBtn = document.querySelector("#btnCancelarInclusaoMov");
const salvarInclusaoMovBtn = document.querySelector("#btnSalvarInclusaoMov");
const selectTipo = document.querySelector("#tipo");
const selectTag = document.querySelector("#tag");
const dataInclusaoMov = document.querySelector("#dataInclusaoMov");
const valorMov = document.querySelector("#valorMov");

salvarInclusaoMovBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!valorMov.value || valorMov.value <= 0) {
    await Swal.fire({
      icon: "warning",
      title: "Valor incorreto",
      text: "Informe o valor corretamente.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  if (!dataInclusaoMov.value) {
    await Swal.fire({
      icon: "warning",
      title: "Data obrigatória",
      text: "Informe a data.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  try {
    const respostaInclusaoMov = await fetch(
      "http://localhost:8000/create_transaction/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: Number(valorMov.value),
          date: dataInclusaoMov.value,
          type: selectTipo.value,
          tag: selectTag.value,
        }),
      },
    );

    const dados = await respostaInclusaoMov.json();

    if (!respostaInclusaoMov.ok) {
      await Swal.fire({
        icon: "error",
        title: "Erro",
        text: dados.detail || "Erro ao incluir movimentação.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Movimentação incluída!",
      text: "Sua movimentação foi incluída com sucesso!",
      confirmButtonColor: "#1e3a8a",
    });

    valorMov.value = "";
    dataInclusaoMov.value = "";
    if (selectTipo) selectTipo.selectedIndex = 0;
    if (selectTag) selectTag.selectedIndex = 0;

    modalInclusao.classList.remove("mostrar");

    btnFiltro.click();
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

openModalInclusaoBtn.addEventListener("click", () => {
  modalInclusao.classList.add("mostrar");
});

closeModalInclusaoBtn.addEventListener("click", () => {
  modalInclusao.classList.remove("mostrar");
});

window.addEventListener("click", (e) => {
  if (e.target === modalInclusao) {
    modalInclusao.classList.remove("mostrar");
  }
});

//Parte da exclusao e modal de alteracao
const modalAlteracao = document.querySelector("#modalAlteracao");
const closeModalAlteracaoBtn = document.querySelector(
  "#btnCancelarAlteracaoMov",
);
const salvarAlteracaoMovBtn = document.querySelector("#btnSalvarAlteracaoMov");
const selectTipoAlteracao = document.querySelector("#tipoAlteracao");
const selectTagAlteracao = document.querySelector("#tagAlteracao");
const dataAlteracaoMov = document.querySelector("#dataAlteracaoMov");
const valorAlteracaoMov = document.querySelector("#valorAlteracaoMov");

let transactionIdAtual = null;

resultado.addEventListener("click", async (e) => {
  const token = localStorage.getItem("token");

  if (e.target.classList.contains("btnExcluirMov")) {
    const transactionId = e.target.dataset.id;

    const confirmacao = await Swal.fire({
      title: "Deseja excluir esta movimentação?",
      text: "Essa ação não poderá ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    if (confirmacao.isConfirmed) {
      try {
        const resposta = await fetch(
          `http://localhost:8000/delete_transaction/${transactionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (resposta.ok) {
          await Swal.fire({
            icon: "success",
            title: "Excluído!",
            text: "A movimentação foi removida com sucesso.",
            confirmButtonColor: "#1e3a8a",
          });

          btnFiltro.click();
        } else {
          const dadosErro = await resposta.json();
          Swal.fire({
            icon: "error",
            title: "Erro",
            text:
              dadosErro.detail || "Não foi possível excluir a movimentação.",
            confirmButtonColor: "#1e3a8a",
          });
        }
      } catch (erro) {
        console.error(erro);
        Swal.fire({
          icon: "error",
          title: "Erro de conexão",
          text: "Não foi possível conectar ao servidor para excluir.",
          confirmButtonColor: "#1e3a8a",
        });
      }
    }
  }

  if (e.target.classList.contains("btnAlterarMov")) {
    transactionIdAtual = e.target.dataset.id;

    const linha = e.target.closest("tr");
    const celulas = linha.querySelectorAll("td");

    const dataValue = celulas[0].textContent;
    const tipoValue = celulas[1].textContent.trim();
    const tagValue = celulas[2].textContent.trim();
    const valorText = celulas[3].textContent
      .replace(/[R$]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    const dataParts = dataValue.split("/");
    const dataFormatada = `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`;

    dataAlteracaoMov.value = dataFormatada;
    selectTipoAlteracao.value = tipoValue;
    selectTagAlteracao.value = tagValue;
    valorAlteracaoMov.value = valorText;

    modalAlteracao.classList.add("mostrar");
  }
});

salvarAlteracaoMovBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!transactionIdAtual) {
    await Swal.fire({
      icon: "error",
      title: "Erro",
      text: "ID da transação não encontrado.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  if (!selectTagAlteracao.value) {
    await Swal.fire({
      icon: "warning",
      title: "Tag incorreta",
      text: "Informe um Tag valida.",
      confirmButtonText: "#1e3a8a",
    });
    return;
  }

  if (!selectTipoAlteracao.value) {
    await Swal.fire({
      icon: "warning",
      title: "Tipo incorreto",
      text: "Informe um tipo valido",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  if (!valorAlteracaoMov.value || valorAlteracaoMov.value <= 0) {
    await Swal.fire({
      icon: "warning",
      title: "Valor incorreto",
      text: "Informe o valor corretamente.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  if (!dataAlteracaoMov.value) {
    await Swal.fire({
      icon: "warning",
      title: "Data obrigatória",
      text: "Informe a data.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  try {
    const resposta = await fetch(
      `http://localhost:8000/update_transaction/${transactionIdAtual}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: Number(valorAlteracaoMov.value),
          date: dataAlteracaoMov.value,
          type: selectTipoAlteracao.value,
          tag: selectTagAlteracao.value,
        }),
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      await Swal.fire({
        icon: "error",
        title: "Erro",
        text: dados.detail || "Erro ao alterar movimentação.",
        confirmButtonColor: "#1e3a8a",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Movimentação alterada!",
      text: "Sua movimentação foi alterada com sucesso!",
      confirmButtonColor: "#1e3a8a",
    });

    modalAlteracao.classList.remove("mostrar");

    transactionIdAtual = null;
    valorAlteracaoMov.value = "";
    dataAlteracaoMov.value = "";

    btnFiltro.click();
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

closeModalAlteracaoBtn.addEventListener("click", () => {
  modalAlteracao.classList.remove("mostrar");
  transactionIdAtual = null;
});

window.addEventListener("click", (e) => {
  if (e.target === modalAlteracao) {
    modalAlteracao.classList.remove("mostrar");
    transactionIdAtual = null;
  }
});

//Funcao para pre-setar uma data ao logar e realizar a funcao do retorno
function configurarDatasPadrao() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  dataInicial.value = `${ano}-${mes}-01`;
  dataFinal.value = `${ano}-${mes}-${dia}`;
}

document.addEventListener("DOMContentLoaded", () => {
  configurarDatasPadrao();

  const token = localStorage.getItem("token");
  if (token) {
    btnFiltro.click();
  }
});

//Funcao para gerar os dados dos graficos
function processarDadosParaGraficos(transacoes) {
  const entradas = transacoes.filter((t) => t.type === "Entrada");
  const saidas = transacoes.filter((t) => t.type === "Saída");

  const categorias = {};
  saidas.forEach((t) => {
    categorias[t.tag] = (categorias[t.tag] || 0) + Number(t.value);
  });

  const saldoDiario = {};
  const datasOrdenadas = [...new Set(transacoes.map((t) => t.date))].sort();

  let saldoAcumulado = 0;
  datasOrdenadas.forEach((data) => {
    const diaEntradas = transacoes
      .filter((t) => t.date === data && t.type === "Entrada")
      .reduce((sum, t) => sum + Number(t.value), 0);

    const diaSaidas = transacoes
      .filter((t) => t.date === data && t.type === "Saída")
      .reduce((sum, t) => sum + Number(t.value), 0);

    saldoAcumulado += diaEntradas - diaSaidas;
    saldoDiario[data] = saldoAcumulado;
  });

  return {
    categorias: {
      labels: Object.keys(categorias),
      values: Object.values(categorias),
    },
    saldoDiario: {
      labels: Object.keys(saldoDiario),
      values: Object.values(saldoDiario),
    },
  };
}

//Gerar os graficos
let graficoCategorias = null;
let graficoSaldo = null;

function criarGraficos(dados) {
  const dadosProcessados = processarDadosParaGraficos(dados);

  //Grafico Pizza
  const ctxCategorias = document
    .getElementById("graficoCategorias")
    .getContext("2d");

  if (graficoCategorias) {
    graficoCategorias.destroy();
  }

  graficoCategorias = new Chart(ctxCategorias, {
    type: "doughnut",
    data: {
      labels: dadosProcessados.categorias.labels,
      datasets: [
        {
          data: dadosProcessados.categorias.values,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#C9CBCF",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        title: {
          display: true,
          text: "Gastos por Categoria",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: R$ ${context.parsed.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Grafico linha
  const ctxSaldo = document.getElementById("graficoSaldo").getContext("2d");

  if (graficoSaldo) {
    graficoSaldo.destroy();
  }

  const labelsFormatados = dadosProcessados.saldoDiario.labels.map((data) => {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}`;
  });

  graficoSaldo = new Chart(ctxSaldo, {
    type: "line",
    data: {
      labels: labelsFormatados,
      datasets: [
        {
          label: "Saldo Acumulado",
          data: dadosProcessados.saldoDiario.values,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        title: {
          display: true,
          text: "Evolução do Saldo",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Saldo: R$ ${context.parsed.y.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "R$ " + value.toFixed(2);
            },
          },
        },
      },
    },
  });
}

//Funcao dos cards
function atualizarCards(movimentacoes) {
  const totalEntradas = movimentacoes
    .filter((t) => t.type === "Entrada")
    .reduce((sum, t) => sum + Number(t.value), 0);

  const totalSaidas = movimentacoes
    .filter((t) => t.type === "Saída")
    .reduce((sum, t) => sum + Number(t.value), 0);

  const saldo = totalEntradas - totalSaidas;

  document.getElementById("saldo").textContent = saldo.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  document.getElementById("entradas").textContent =
    totalEntradas.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  document.getElementById("saidas").textContent = totalSaidas.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  );
}
