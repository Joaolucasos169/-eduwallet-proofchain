// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EduWallet {
    
    // estrutura basica do diploma
    struct Diploma {
        bool existe;
        string nomeAluno;
        string instituicao;
        uint256 timestamp;
        address emissor;
    }

    // mapeia o hash sha-256 para os dados do diploma
    mapping(string => Diploma) public diplomas;

    // log para rastreabilidade
    event DiplomaRegistrado(string hashDoc, string nomeAluno, string instituicao, address emissor);

    // funcao de escrita (chamada pela instituicao)
    function registrarDiploma(string memory hashDoc, string memory nomeAluno, string memory instituicao) public {
        require(!diplomas[hashDoc].existe, "Diploma ja registrado na rede");

        diplomas[hashDoc] = Diploma({
            existe: true,
            nomeAluno: nomeAluno,
            instituicao: instituicao,
            timestamp: block.timestamp,
            emissor: msg.sender
        });

        emit DiplomaRegistrado(hashDoc, nomeAluno, instituicao, msg.sender);
    }

    // funcao de leitura (chamada pela empresa/validador)
    function verificarDiploma(string memory hashDoc) public view returns (bool valido, string memory nomeAluno, string memory instituicao, uint256 timestamp) {
        Diploma memory d = diplomas[hashDoc];
        return (d.existe, d.nomeAluno, d.instituicao, d.timestamp);
    }
}