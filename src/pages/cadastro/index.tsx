import React, { useState } from 'react';
import Header from '../../components/header/index';
import Footer from '../../components/footer/index';
import Input from '../../components/input/index';
import Button from '../../components/button/index';
import { useHistory } from 'react-router-dom';
import { useFirebaseApp } from 'reactfire';

function Cadastro() {
  let history = useHistory();
  const firebase = useFirebaseApp();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrarUsuario = () => {
    // Apenas email e senha são utilizados para criar uma conta no firebase
    const form = {
      email: email,
      senha: senha
    }

    if(form.email.length === 0 
      || form.senha.length === 0){
      alert('Digite email e senhas corretamente.');
    }

    // Criação de usuário com o Firebase
    firebase.auth().createUserWithEmailAndPassword(form.email, form.senha)
      .then(resp => {
        // Se cair no then, o usuário é autenticado automaticamente
        if(resp.user){
          localStorage.setItem('token-usuario', resp.user?.refreshToken);
          history.push('/home')
        }
        else{
          return alert('Houve um erro desconhecido na autenticação de usuário.')
        }

        console.log(resp)
      })
      .catch(err => {
        console.log(err);
      })
  }

  return (
    <div>
      <Header description="Faça o Cadastro para o acesso" />

      <div className="centro">
        <form className="form-container" onSubmit={event => {
          event.preventDefault()
          cadastrarUsuario();
        }}>
          <h1>Cadastro</h1>

          <Input type="text" label="Email" name="email" onChange={e => setEmail(e.target.value)} />

          <Input type="password" label="Senha" name="senha" onChange={e => setSenha(e.target.value)} />

          <Button name="Enviar" type="submit" />
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Cadastro;
