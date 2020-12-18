import React, { useEffect, useState } from 'react';

import imgRefresh from '../../assets/images/refresh.png';
import imgTrash from '../../assets/images/trash.png';
import logoCinema from '../../assets/images/cinema.png';
import Button from '../../components/button';

import Footer from '../../components/footer';
import Header from '../../components/header';

import './style.css';

// Database do Cloud Firestore
import { db } from '../../utils/firebaseConfig';
import { Modal, Button as ButtonB, Form } from 'react-bootstrap';

function Filme() {
  const [genero, setGenero] = useState('');

  const [generos, setGeneros] = useState<any>([]);

  const [filmeId, setFilmeId] = useState('');

  const [filme, setFilme] = useState('');

  const [filmes, setFilmes] = useState<any>([]);

  // Váriavel booleana para o modal
  const [show, setShow] = useState(false);

  // Função para mostrar modal
  const showModal = () => setShow(true);

  // Função para esconder modal
  const hideModal = () => setShow(false);

  useEffect(() => {
    listarFilmesAndGeneros();
  }, []);

  const limparCampos = () => {
    setFilme('');
    setFilmeId('');
    setGenero('');
  }

  const listarFilmesAndGeneros = () => {
    try {
      // Get da coleção "Filmes" do Firestore
      // o SnapShoot é um 'listening', detecta atualizações no banco de dados e atualiza a lista
      db.collection('Filmes').onSnapshot(
        resp => {
          // Itera entre todos os dados do array retornados pelo fireStore e monta o nosso objeto

          var f = resp.docs.map((filme: any) => {
            return {
              id: filme.id,
              titulo: filme.data().titulo,
              genero: filme.data().genero
            }
          })

          setFilmes(f);
          console.log(f)

        }, function erro(err) {
          console.log(err);
        })

      // Get da coleção "Geneross" do Firestore
      db.collection('Generos').get()
        .then(resp => {
          // Itera entre todos os dados do array retornados pelo fireStore e monta o nosso objeto

          var g = resp.docs.map((genero: any) => {
            return {
              id: genero.id,
              nome: genero.data().nome,
            }
          })

          setGeneros(g);
          console.log(g);
        })
        .catch(err => {
          console.log(err)
        })
    } catch (error) {
      console.log(error)
    }
  }

  const remove = (id: string) => {
    if (window.confirm('Deseja excluir o Filme?')) {
      // Deleta um filme por ID do Firestore
      db.collection('Filmes').doc(id).delete()
        .then(resp => {
          alert('Filme deletado com sucesso.');
        })
        .catch(err => {
          console.log(err);
        })
    }
  }

  const refresh = (id: string) => {
    // Recupera filme por ID
    db.collection('Filmes').doc(id).get()
      .then(resp => {
        setFilme(resp.data()?.titulo);
        setGenero(resp.data()?.genero);
        setFilmeId(resp.id);
      })
      .catch(err => {
        console.log(err);
      });
  }

  const update = () => {
    const form = {
      titulo: filme,
      genero: genero
    };

    if (filmeId === '')
      return alert('Não foi possível recuperar informações do filme para atualiza-lo.');

    // Atualiza o filme por ID
    db.collection('Filmes').doc(filmeId)
      .update(form)
      .then(resp => {
        console.log(resp);
        alert('Filme Atualizado!')
      })
      .catch(err => {
        console.log(err);
      })
      hideModal();
      limparCampos();
  }

  const create = () => {
    const form = {
      titulo: filme,
      genero: genero
    };

    if(form.titulo === '' || form.genero === '')
      return alert('Preencha os campos Título e Gênero.')

    db.collection('Filmes').add(form)
      .then(resp => {
        if (resp.id) {
          alert('Filme cadastrado com sucesso.');
        }
      })
      .catch(err => {
        alert('Houve um erro no cadastro do filme.')
      })

    limparCampos();
  }

  return (
    <div>
      <Header description="Cadastre os filmes de sua preferência" />

      <div className="conteudo">
        <div className="box-title">
          <h1>Filmes</h1>
          <img className="centralizarIMG" src={logoCinema} alt="Logo de cinema" />
        </div>

        <div className="box-listar-filme">
          <h3>Lista de Filmes</h3>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="thead-cor">
              <tr>
                <th scope="col">Filme</th>
                <th scope="col">Gênero</th>
                <th scope="col">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {
                filmes.map((item: any) => {
                  return (
                    <tr className="row-filme" key={item.id}>
                      <td>{item.titulo}</td>
                      <td>{item.genero}</td>
                      <td className="acts">
                        <img className="icon" src={imgRefresh} alt="Logo de refresh" onClick={() => {
                          refresh(item.id)
                          showModal();
                        }} />
                        <img className="icon" src={imgTrash} alt="Logo de lixo" onClick={() => remove(item.id)} />
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        <form className="cadastro-filmes" onSubmit={event => {
          event.preventDefault();
          create();
        }}>
          <div className="box-cadastro-filmes">
            <Form.Group controlId="nome-filme">
              <Form.Label>Nome do Filme:</Form.Label>
              <Form.Control type="text" name="filme" value={filme} onChange={e => setFilme(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="genero">
              <Form.Label>Gênero:</Form.Label>
              <Form.Control as="select" onChange={e => {
                setGenero(e.target.value)
              }} value={genero}>
                <option value="0">Selecione um Gênero</option>
                {
                  generos.map((item: any) => {
                    return <option value={item.nome}>{item.nome}</option>
                  })
                }
              </Form.Control>
            </Form.Group>

          </div>

          <div className="btn">
            <Button name="Cadastrar Filme" type="submit" />
          </div>

        </form>

      </div>
      <Modal
        show={show}
        onHide={() => {
          hideModal();
          limparCampos();
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Atualizar Filme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="container-modal" onSubmit={event => {
            event.preventDefault();
            update()
          }}>

            <Form.Group controlId="nome-filme-up">
              <Form.Label>Nome do Filme:</Form.Label>
              <Form.Control type="text" name="filme" value={filme} onChange={e => setFilme(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="genero-up">
              <Form.Label>Gênero:</Form.Label>
              <Form.Control as="select" onChange={e => {
                setGenero(e.target.value)
              }} value={genero}>
                <option value="0">Selecione um Gênero</option>
                {
                  generos.map((item: any) => {
                    return <option value={item.nome}>{item.nome}</option>
                  })
                }
              </Form.Control>
            </Form.Group>
            
            <ButtonB type="submit">
              Salvar
            </ButtonB>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <ButtonB variant="danger" onClick={() => {
            hideModal();
            limparCampos();
          }}>
            Fechar
          </ButtonB>
        </Modal.Footer>
      </Modal>
      <Footer />
    </div>

  );
}

export default Filme;