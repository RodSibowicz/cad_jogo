const mysql = require('mysql2')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // O diretório onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // Nome do arquivo no momento do upload
    }
});

const upload = multer({ storage: storage });

//constante que recebe todas as funções da dependência express
const app = express();
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
    

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cadastro'
});

connection.connect(function(err){
    if (err){
        console.error('erro', err)
        return
    }
console.log("Conexão estabelecida com sucesso")   
 }
)


app.get("/formulario",function (req, res) {
    res.sendFile(__dirname + "/formulario.html");
})

app.post('/adicionar', upload.single('imagem'), (req, res) =>{
    const nome = req.body.nome;
    const senha = req.body.senha;
    const nickname = req.body.nickname;
    const bio = req.body.bio;
    const cidade = req.body.cidade;
    const estado= req.body.estado ;
    const imagem_path = req.file.filename;


    const values = [nome, senha, nickname, bio, cidade, estado,  imagem_path]
    const insert = "insert into usuario(nome, senha, nickname, bio, cidade, estado,  imagem_path) values(?,?,?, ?, ?, ?, ?)";

    connection.query(insert, values, function(err, result) {
        if (!err) {
        console.log("dados inseridos com sucesso!")
        res.send("dados inseridos");
        }
    else{
        console.log("Não foi possivel inserir os dados", err)
        res.send("erro!");
        }
    })
})

app.listen(8081, function(){
    console.log("servidor rodando na url: http://localhost:8081") 
})


app.get("/listar", function(req, res){
    const selectAll = "select * from usuario";

    connection.query(selectAll, function(err, rows){
        if (!err) {
        console.log("dados inseridos com sucesso!")
        res.send(`
        <html>
            <head>
            <link rel="stylesheet" type="text/css" href="/style.css">
                <title>Cadastro de jogador</title>
            </head>
            <body>
                <h1>Jogadores cadastrados</h1>
                    <table>
                    <tr>
                    <th>ID</th>
                    <th>nome</th>
                   
                    <th>nickname</th>
                    <th>bio</th>
                    <th>cidade</th>
                    <th>estado</th>
                    <th>imagem</th>
                    <th>Ações</th>
                    </tr>
                    ${rows.map(row =>`
                    <tr>
                        <td>${row.id}</td>
                        <td>${row.nome}</td>
                      
                        <td>${row.nickname}</td>
                        <td>${row.bio}</td>
                        <td>${row.cidade}</td>
                        <td>${row.estado}</td>    
                        <td> <img src= "/uploads/${row.imagem_path}" alt="imagem" style="width:48px; height:48px";> </td>                        
        <td>
           
                    </tr>
                `).join('')}
                </table>
            </tr>
            </body>
        </html>            
        `);
        }else{
        console.log("erro ao listar os dados!", err)
        res.send("erro!")
        }
    })
    
    })
    
    
app.get("/", function(req, res) {
    res.send(`
        <html>
            <head>
            <link rel="stylesheet" type="text/css" href="/style.css">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Butcherman&display=swap" rel="stylesheet">
                <title>Sistema de gerenciamento de Usuarios</title>
            </head>
            <body>
                <h1>Sistema de gerenciamento de materiais no estoque</h1>
                <p> <a href= "http://localhost:8081/formulario"> cadastrar usuario </a></p>
                <p> <a href= "http://localhost:8081/listar"> Relatorio de cadastros </a></p>

            </body>
        </html>
        `)
})

app.get("/alterar/:id", function (req, res) {
    const userId = req.params.id;
    // Recupere as informações do usuário com base no ID e renderize o formulário de alteração
    // Exemplo: const user = buscarUsuarioPorId(userId);
    res.render('pagina_de_alteracao', { user });
});

app.get("/excluir/:id", function (req, res) {
    const userId = req.params.id;
    // Execute a ação de exclusão do usuário com base no ID
    // Exemplo: excluirUsuario(userId);
    res.redirect('/listar'); // Redirecione de volta para a lista de usuários
});





//npm init --criar o package.json (arquivo com info dos projetos)
//npm install --save mysql2 -- dependencia para conexão sql
//npm install express mysql2 -- dependencia para conexão front, back