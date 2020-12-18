import React, { useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Cadastro from './pages/cadastro/index'
import Home from './pages/home/index'
import Login from './pages/login/index'
import Generos from './pages/generos/generos';
import FilmesAdm from './pages/filmesAdm/index';

function Routes() {
  const getToken = () => {
    return localStorage.getItem('token-usuario');
  }

  // Rota privada para impedir usuários de entrarem em páginas quando não logados
  const RotaPrivadaComum = ({ Component, ...rest }: any) => (
    <Route
      {...rest}
      render={props =>
        // Se sim, renderiza de acordo com a rota solicitada e permitida
        // Se não, redireciona para a página de login
        getToken() !== null ? (<Component {...props} />) : (<Redirect to={{ pathname: "/" }} />)
      }
    />
  );

  const NotAuthenticated = ({ Component, ...rest }: any) => (
    <Route
      {...rest}
      render={props =>
        // Se sim, renderiza de acordo com a rota solicitada e permitida
        // Se não, redireciona para a página de login
        getToken() == null ? (<Component {...props} />) : (<Redirect to={{ pathname: "/home" }} />)
      }
    />
  );

  return (
    <BrowserRouter>
      <Switch>
        {/* o 'C' de Component deve estar maiúsculo para funcionar rotas privadas */}
        <NotAuthenticated path="/" exact Component={Login} />
        <NotAuthenticated path="/cadastro" Component={Cadastro} />
        <RotaPrivadaComum path="/home" Component={Home} />
        <RotaPrivadaComum path="/filmesAdm" Component={FilmesAdm} />
        <RotaPrivadaComum path="/generos" Component={Generos} />
      </Switch>
    </BrowserRouter>
  );
}

export default Routes;
