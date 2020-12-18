import React, { useState, useEffect } from 'react';
import api from '../../services/services';
import Header from '../../components/header/index';
import Footer from '../../components/footer/index';
import Input from '../../components/input/index';
import Button from '../../components/button/index';
import Theater from '../../assets/images/theater.png'
import Refresh from '../../assets/images/refresh.png'
import Trash from '../../assets/images/trash.png'
import './style.css'

// Firestore (database do firebase)
import { db } from '../../utils/firebaseConfig';

function Generos() {
  const [genero, setGenero] = useState('');
  const [idGenero, setIdGenero] = useState(0);
  const [generos, setGeneros] = useState<any>([]);

  // Quando renderiza a página executa uma vez (recebe todos os generos)
  useEffect(() => {
    listar();
  }, [])

  const listar = () => {
    // Get da coleção "Filmes" do Firestore
    db.collection('Generos').onSnapshot(
      resp => {
        // Itera entre todos os dados do array retornados pelo fireStore e monta o nosso objeto

        var g = resp.docs.map((gen: any) => {
          return {
            id: gen.id,
            nome: gen.data().nome,
          }
        })

        setGeneros(g);
        console.log(g)

      }, function erro(err) {
        console.log(err);
      })
  }

  // Busca gênero por ID para ser atualizado no salvar
  const refresh = (id: number) => {

  }

  // Quando clica no botão "Salvar"
  const create = () => {
    const form = {
      nome: genero,
    }

    db.collection('Generos').add(form)
      .then(resp => {
        if (resp.id) {
          alert('Gênero cadastrado com sucesso.');
        }
      })
      .catch(err => {
        alert('Houve um erro no cadastro do filme.')
      })
  }

  // Quando clica na imagem de lixo
  const trash = (id: number) => {

  }

  // Listagem dos generos
  const generosRender = () => {
    return (
      <tbody>
        {
          // Listando ITENS com TYPESCRIPT (genero recebe QUALQUER item, necessário para reconhecer as props)
          generos.map((genero: any) => {
            return (
              // Linha com o ID do genero
              <tr key={genero.id}>
                <td>{genero.nome}</td>
                <td className="acts">
                  <img src={Refresh} alt="Refresh" className="icon" onClick={() => refresh(genero.id)} />
                  <img src={Trash} alt="Trash" className="icon" onClick={() => trash(genero.id)} /></td>
              </tr>
            );
          })
        }
      </tbody>
    );
  }

  return (
    <div>
      <Header description="Generos" />

      <h1>Gêneros</h1>
      <div className="img-theater">
        <img src={Theater} alt="Theater" />
      </div>

      <h3>Lista de Gêneros</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead className="thead-cor">
            <tr>
              <th scope="col">Gênero</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          {generosRender()}
        </table>

        <form className="form" onSubmit={event => {
          event.preventDefault()
          create();
        }}>
          <div>
            <Input label="Nome" name="name" onChange={e => setGenero(e.target.value)} />
          </div>
          <div className="btn">
            <Button name="Criar Gênero" type="submit" />
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Generos;
