
const express = require("express");
const cors = require("cors");
const conexao = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const origensPermitidas = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(origem => origem.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Permite chamadas sem Origin, como curl e testes internos.
        if (!origin || origensPermitidas.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origem não permitida pelo CORS."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Verificar disponibilidade da API e do banco
app.get("/health", async (req, res) => {
    try {
        await conexao.query("SELECT 1");

        res.status(200).json({
            mensagem: "API e MySQL funcionando!"
        });
    } catch (erro) {
        res.status(503).json({
            erro: "Banco de dados indisponível."
        });
    }
});

// Cadastrar produto
app.post("/produto", async (req, res) => {
    try {
        const { nome, categoria, preco, quantidade } = req.body;

        if (
            typeof nome !== "string" ||
            !nome.trim() ||
            nome.trim().length > 120
        ) {
            return res.status(400).json({
                erro: "Nome do produto inválido."
            });
        }

        if (
            typeof categoria !== "string" ||
            !categoria.trim() ||
            categoria.trim().length > 80
        ) {
            return res.status(400).json({
                erro: "Categoria inválida."
            });
        }

        if (
            typeof preco !== "number" ||
            !Number.isFinite(preco) ||
            preco <= 0 ||
            Math.round(preco * 100) !== preco * 100 ||
            preco >= 100000000
        ) {
            return res.status(400).json({
                erro: "Preço inválido."
            });
        }

        if (
            typeof quantidade !== "number" ||
            !Number.isSafeInteger(quantidade) ||
            quantidade < 0 ||
            quantidade > 2147483647
        ) {
            return res.status(400).json({
                erro: "Quantidade inválida."
            });
        }

        const sql = `
            INSERT INTO produtos
            (nome, categoria, preco, quantidade)
            VALUES (?, ?, ?, ?)
        `;

        const [resultado] = await conexao.execute(sql, [
            nome.trim(),
            categoria.trim(),
            preco,
            quantidade
        ]);

        return res.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error("Erro ao cadastrar produto:", erro);

        return res.status(500).json({
            erro: "Erro interno ao cadastrar produto."
        });
    }
});

// Listar produtos
app.get("/produtos", async (req, res) => {
    try {
        const sql = `
            SELECT id, nome, categoria, preco, quantidade
            FROM produtos
            ORDER BY id DESC
        `;

        const [produtos] = await conexao.query(sql);

        return res.status(200).json(produtos);

    } catch (erro) {
        console.error("Erro ao listar produtos:", erro);

        return res.status(500).json({
            erro: "Erro interno ao consultar produtos."
        });
    }
});

// Tratamento de erros do CORS e JSON
app.use((erro, req, res, next) => {
    if (res.headersSent) {
        return next(erro);
    }

    if (erro.message === "Origem não permitida pelo CORS.") {
        return res.status(403).json({
            erro: erro.message
        });
    }

    if (erro instanceof SyntaxError && erro.status === 400) {
        return res.status(400).json({
            erro: "JSON inválido."
        });
    }

    console.error(erro);

    return res.status(500).json({
        erro: "Erro interno do servidor."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API executando na porta ${PORT}`);
});
