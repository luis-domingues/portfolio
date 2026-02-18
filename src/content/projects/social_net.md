---
title: "SocialNET"
description: "API minimalista com funcionalidades similares ao X (antigo Twitter)."
github: "https://github.com/luis-domingues/social-net-api"
---
O SocialNET foi o primeiro sistema robusto de backend que desenvolvi. A ideia surgiu durante a discussão política entre Elon Musk e Alexandre de Moraes sobre o banimento da rede social X (antigo Twitter) no Brasil. Nesse contexto, notei que várias pessoas da bolha dev (bolha na qual eu faço parte) migraram para o Bluesky na época. Até então eu não fazia ideia do que era o Bluesky, mas comecei a usá-lo e percebi que se tratava de uma rede social open-source, o que despertou minha curiosidade. Isso gerou um gatilho e tanto para mim do tipo “por que não criar a minha própria rede social?”. Foi daí que veio a ideia do SocialNET (“Social” que remete a algo como networking/social communication; “NET” porque desenvolvi usando .NET - eu sei, sou péssimo com nomes).

Inicialmente, eu não sabia por onde começar o desenvolvimento. Comecei esboçando um esquema no Excalidraw sobre o funcionamento da rede, desde o registro até um sistema de notificações em tempo real. Nada tão complexo ou muito elaborado, afinal era um projeto pessoal que não iria ser deployado. 

## Modelagem e primeiros passos
Eu precisava de uma tabela que armazenasse dados dos usuários, como o username e e-mail (ambos únicos), uma senha com hash, número de telefone, além de um identificador inteiro, data de criação e status de atividade. Esses seriam os dados de registro no sistema para que um usuário acessasse o SocialNET, precisaria ter um cadastrado.

```cs
using System.Text.Json.Serialization;

namespace SocialNetApi.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }

    [JsonIgnore]
    public ICollection<Post> Posts { get; set; }
        
    [JsonIgnore]
    public ICollection<Like> Likes { get; set; }
    
    [JsonIgnore]
    public ICollection<Comment> Comments { get; set; }

    public IEnumerable<Follower> Following { get; set; }
    public IEnumerable<Follower> Followers { get; set; }
}
```

A partir de então, comecei dando meus primeiros passos no backend. Na época eu não tinha muito conhecimento sobre escalabilidade, então montei tudo em um monolito com um único SGBD (SQL Server) e utilizei o Entity Framework para orquestrar os dados da minha tabela de usuários, um controller para ter o endpoint do registro, obter um usuário através do ID e do username, excluir o usuário e atualizar informações. Documentei e testei tudo no Swagger. Essa parte foi tranquila, pois os endpoints eram simples de implementar. E agora que eu tinha como registrar um usuário, o próximo passo era desenvolver a autenticação desse usuário registrado.

## Autenticação com JWT
Para a autenticação, estudei bastante por artigos, vídeos, documentações, mas os que mais me ajudaram foram [Configure JWT bearer authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-10.0) e esse [vídeo do canal Milan Jovanović](https://youtu.be/Blrn5JyAl6E?si=ofsXJX9tESWM7Wg8). Como eu nunca tinha feito uma autenticação real antes, fiquei um pouco travado nessa parte, mas com o passar do tempo as coisas foram fluindo melhor. Em resumo, implementei uma lógica de segurança que impedia o acesso de usuários não autorizados ao feed principal. Ou seja, para acessar o feed, a pessoa precisava estar registrada e fazer login. Se as credenciais estivessem corretas, o backend retornava um token de acesso com prazo de validade, que então autorizava o acesso ao feed.

## Posts e relacionamentos
Ok, temos até então como registrar um usuário e como autenticá-lo, restando apenas as funcionalidades que tornam o projeto parecido com uma rede social. Repeti o processo da criação de usuários para os posts, onde todo usuário poderia fazer uma postagem. Nessa parte, tive que lidar com relacionamentos de tabelas distintas (usuários e posts) e foi aí que notei uma defasagem no meu entendimento sobre **Collections** em C#, pois para listar os posts de um usuário, eu precisava de um array dinâmico, o que me fez perceber uma lacuna no meu conhecimento sobre Collections. Precisei dar alguns passos para trás e estudar melhor sobre **Generic** e **LINQ** para que eu finalmente pudesse desenvolver a parte das postagens. Funcionava assim: criei endpoints específicos para posts, permitindo 
criar um post ou thread
buscar por ID ou palavras-chave
comentar e dar like. 
Fora as regras de funcionamento como, o dono do post poderia excluí-lo, e nesse caso todos os likes, comentários e threads relacionados seriam removidos. Outra regra era a de reply a reply, onde eu poderia comentar um comentário.

## Perfis e sistema de seguidores
Com os posts funcionando, notei que poderia melhorar esse sistema e criar um próprio feed orgânico e único no frontend. Foi aí que percebi que, para os posts aparecerem no feed, eu precisava de um sistema de seguidores, mas para desenvolver tal sistema, era necessário que o usuário tivesse um perfil próprio para editar suas informações de usuário, visualizar suas postagens, sua lista de seguidores e de quem ele segue. O processo foi semelhante ao anterior: modelei as novas tabelas, escrevi as consultas SQL com joins e criei as regras de negócio específicas.

## Notificações em tempo real 
Para finalizar, resolvi implementar um sistema de notificações em tempo real. Usei SignalR para isso. No começo, as notificações não chegavam, até que descobri que precisava configurar corretamente os hubs e os grupos de conexão. Depois de alguns testes, finalmente consegui. E pelo que eu entendi, sempre que alguém interagia com o perfil ou postagem de um usuário, uma notificação era enviada para o ID da central de notificações daquele usuário, informando o tipo e o momento da interação. Foi a primeira vez que trabalhei com comunicação em tempo real, e o aprendizado foi enorme.

## Aprendizados
Hoje, olhando para trás, vejo pontos que poderia ter feito melhor:
Na época, eu expunha minhas entidades diretamente nas respostas da API. Depois aprendi que é mais seguro e organizado usar DTOs para separar a camada de domínio da camada de apresentação e usando packages nugets como MediatoR.
Eu também não tinha realizados os testes unitários e de integração - algo que faço em todos os meus projetos! Se fosse começar de novo, incluiria desde o início para garantir que as regras de negócio funcionassem corretamente.
Na parte da arquitetura, vi que o monolito ficou extremamente complexo mesmo tendo servido bem, mas hoje eu consideraria dividir em camadas como Clean Architecture para facilitar uma manutenção ou adicionar novas features.

O projeto está parado no momento, mas serve como um marco na minha evolução como dev. Pretendo retomá-lo em algum momento para implementar melhorias como cache com Redis, paginação nas listas de posts e seguidores e deploy em algum serviço de nuvem para que as pessoas também possam usar e testar.

Eu diria que o SocialNET foi o meu primeiro projeto fullstack que me deu confiança de olhar para um problema e pensar como um engenheiro de software de verdade. Cada dificuldade, desde o JWT até as notificações em tempo real, me ensinou algo novo. Hoje me sinto muito mais preparado para planejar e executar projetos semelhantes e até mesmo mais complexos.
<hr>

### Glossário
**Monolito**: aplicação onde todas as funcionalidades estão em um único código e banco de dados.

**Entity Framework**: biblioteca do .NET que facilita o trabalho com bancos de dados relacionais.

**LINQ**: linguagem de consulta integrada ao C# para manipular coleções de dados.

**SignalR**: biblioteca do .NET para adicionar funcionalidades em tempo real

**DTO**: sigla de Data Transfer Object, que é um objeto simples usado para transferir dados entre camadas, sem lógica de negócio.
