// Não necessita dos CDN's pois estamos utilizando diretamente uma biblioteca própria do Firebase
import firebase from 'firebase';

// Informação de config (estão na página do projeto do firebase)
var firebaseConfig = {
    apiKey: "AIzaSyBbyg14GLvi77Q4s6sO8wQt8IH0fZ6sFfY",
    authDomain: "project-senaivagas.firebaseapp.com",
    projectId: "project-senaivagas",
    storageBucket: "project-senaivagas.appspot.com",
    messagingSenderId: "586545333986",
    appId: "1:586545333986:web:c5791985790616bea800bb",
    measurementId: "G-D2LB2NSRPB"
  };
  // Inicialização do Firebase
  const app = firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  // Para utilizar o firestore nas páginas (Cloud Firestore - Banco de dados não relacional)
  export const db = app.firestore();

  export default firebaseConfig;