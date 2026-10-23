// Configure APENAS as integrações deste módulo.
// Firebase: mesmo projeto já utilizado pelo GeoFacilities.
// As chaves públicas do Firebase e do EmailJS não são senhas de administrador.
export const CONFIG = {
  firebase: {
    apiKey: "AIzaSyAHocNZt0ihtkTplDjLYWMpOFoOj80ycBs",
    authDomain: "geo-facilities.firebaseapp.com",
    projectId: "geo-facilities",
    storageBucket: "geo-facilities.firebasestorage.app",
    messagingSenderId: "379130334399",
    appId: "1:379130334399:web:3ca7ef35480b7ddb6c8a0a"
  },
  imgbb: {
    apiKey: "e98aafa6c14d6865593012f45bb441ab" // Preencha sua chave ImgBB; foto hospedada pode ser acessível por URL.
  },
  emailjs: {
    publicKey: "Tz2VsrXhmLp6_GDRf",
    serviceId: "service_2vokv0b",
    templateId: "template_2323n9f",
    destinatario: "gustavo.batista@energisa.com.br" // Seu colega; configure o destinatário também no template EmailJS.
  }
};
