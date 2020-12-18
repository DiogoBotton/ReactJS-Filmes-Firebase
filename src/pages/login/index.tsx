import React, { useState } from 'react';

// Components
import Header from '../../components/header/index';
import Footer from '../../components/footer/index';
import Input from '../../components/input/index';
import Button from '../../components/button/index';

// React Router DOM
import { useHistory } from 'react-router-dom';

// Global css
import '../../assets/styles/global.css';

// Firebase
import { useFirebaseApp } from 'reactfire';

function Login() {
  let history = useHistory();
  let firebase = useFirebaseApp();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const login = () => {
    const login = {
      email: email,
      senha: senha
    };

    if (login.email.length === 0 || login.senha.length === 0) {
      return alert('Digite email e senha corretamente.');
    }

    // Autenticação automatizada com Firebase
    firebase.auth().signInWithEmailAndPassword(login.email, login.senha)
      .then(resp => {
        // Caso o objeto "user" não for indefinido ou nulo
        if (resp.user) {
          localStorage.setItem('token-usuario', resp.user?.refreshToken);
          history.push('/home')
        }
        else {
          alert('Houve um erro desconhecido na autenticação de usuário.')
        }
        
        // Resposta do backend do firebase
        console.log(resp);
      })
      .catch(err => {
        console.log(err.code)
        if (err.code === 'auth/user-not-found') {
          alert('Usuário não encontrado.')
        }
        else if (err.code === 'auth/invalid-email') {
          alert('Email inválido.')
        }
        else {
          alert('Email ou Senha inválidos.')
        }
      })
  }

  return (
    <div>
      <Header description="Faça o Login e conheça nossa Coletânea" />
      <div className="centro">
        <div>
          <h1>Login</h1>
          {/*Target seria o atributo que aciona o evento, 
            Event, abre o componente que foi acionado o evento em si, para que possa ser manipulado pelo target*/}
          <form className="form-container" onSubmit={event => {
            // Padrão de comportamento (prevenindo o comportamento padrão de eventos)
            event.preventDefault()
            login()
          }}>
            <Input type="text" label="Email" name="email" onChange={e => setEmail(e.target.value)} />
            <Input type="password" label="Senha" name="senha" onChange={e => setSenha(e.target.value)} />

            <Button name="Enviar" type="submit" />
          </form>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
