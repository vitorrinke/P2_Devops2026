
const API_URL = "http://192.168.56.102:3000";

const formulario = document.getElementById("produtoForm");
const btnListar = document.getElementById("btnListar");
const btnCadastrar = document.getElementById("btnCadastrar");
const listaProdutos = document.getElementById("listaProdutos");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        preco: Number(document.getElementById("preco").value),
        quantidade: Number(document.getElementById("quantidade").value)
    };

    btnCadastrar.disabled = true;

    try {
        const resposta = await fetch(`${API_URL}/produto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao cadastrar produto.");
        }

        mostrarMensagem("Produto cadastrado com sucesso!", "sucesso");

        formulario.reset();

        await listarProdutos();

    } catch (erro) {
        mostrarMensagem(erro.message, "erro");
    } finally {
        btnCadastrar.disabled = false;
    }
});

btnListar.addEventListener("click", listarProdutos);

async function listarProdutos() {
    listaProdutos.innerHTML = "";

    try {
        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar os produtos.");
        }

        const produtos = await resposta.json();

        if (produtos.length === 0) {
            listaProdutos.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum produto cadastrado.</td>
                </tr>
            `;
            return;
        }

        produtos.forEach((produto) => {
            const linha = document.createElement("tr");

            const valores = [
                produto.id,
                produto.nome,
                produto.categoria,
                Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }),
                produto.quantidade
            ];

            valores.forEach((valor) => {
                const coluna = document.createElement("td");
                coluna.textContent = valor;
                linha.appendChild(coluna);
            });

            listaProdutos.appendChild(linha);
        });

    } catch (erro) {
        listaProdutos.innerHTML = `
            <tr>
                <td colspan="5">Erro ao carregar os produtos.</td>
            </tr>
        `;

        mostrarMensagem(erro.message, "erro");
    }
}

// Carregar os produtos ao abrir a página
listarProdutos();
