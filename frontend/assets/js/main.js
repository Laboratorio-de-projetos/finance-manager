//SIDEBAR 
const btnMenu = document.querySelector("#btn-sidebar");
const sidebar = document.querySelector(".sidebar");

btnMenu.addEventListener("click", () => {
  sidebar.classList.toggle("aberto");
});


//FILTRO E TABELA
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
    const url = `http://localhost:8000/read_transactions?first_date=${dataInicial.value}&last_date=${dataFinal.value}`;

    const respostaFiltro = await fetch(url, {
      method: "GET", 
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const dados = await respostaFiltro.json();

    if (!respostaFiltro.ok) {
      if (respostaFiltro.status === 404) {
        resultado.innerHTML = ""; 
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
  resultado.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Tag</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        ${movimentacoes
          .map(
            (item) => `
              <tr>
                <td>${item.date}</td>
                <td>${item.tag}</td>
                <td>
                  ${Number(item.value).toLocaleString("pt-BR", {
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


//MODAL DE INCLUSÃO 
const modal = document.querySelector(".modal");
const openModalInclusaoBtn = document.querySelector("#btnIncluirMov");
const closeModalInclusaoBtn = document.querySelector("#btnCancelarInclusaoMov");
const salvarInclusaoMovBtn = document.querySelector("#btnSalvarInclusaoMov");
const selectTipo = document.querySelector("#tipo");
const selectTag = document.querySelector("#tag");
const dataInclusaoMov = document.querySelector("#dataInclusaoMov");
const valorMov = document.querySelector("#valorMov");

salvarInclusaoMovBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!valorMov.value || valorMov.value <= 0){
    await Swal.fire({
      icon: "warning",
      title: "Valor incorreto",
      text: "Informe o valor corretamente.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }

  if(!dataInclusaoMov.value){
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          value: Number(valorMov.value),
          date: dataInclusaoMov.value,
          type: selectTipo.value,
          tag: selectTag.value,
        }),
      }
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
    if(selectTipo) selectTipo.selectedIndex = 0;
    if(selectTag) selectTag.selectedIndex = 0;

    modal.classList.remove("mostrar");

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
  modal.classList.add("mostrar");
});

closeModalInclusaoBtn.addEventListener("click", () => {
  modal.classList.remove("mostrar");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("mostrar");
  }
});


//INICIALIZAÇÃO AUTOMÁTICA
function configurarDatasPadrao() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

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