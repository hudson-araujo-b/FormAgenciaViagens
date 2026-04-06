/* ============================================================
   script.js — Levantamento de Requisitos TCM
   ============================================================ */

var FORMSPREE_URL = 'https://formspree.io/f/maqlojad';

document.addEventListener('DOMContentLoaded', function () {

  var formulario      = document.getElementById('formulario');
  var btnEnviar       = document.getElementById('btn-enviar');
  var btnText         = document.getElementById('btn-text');
  var btnLoading      = document.getElementById('btn-loading');
  var mensagemSucesso = document.getElementById('mensagem-sucesso');

  // ── Envio ──
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (!validarFormulario()) {
      var primeiroErro = formulario.querySelector('.invalido');
      if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    enviarFormulario();
  });

  /* ============================================================
     VALIDAÇÃO
     ============================================================ */
  function validarFormulario() {
    var valido = true;

    // Campos de texto obrigatórios
    formulario.querySelectorAll('input[required], select[required]').forEach(function (campo) {
      var msgErro = campo.parentElement.querySelector('.error-msg');
      if (campo.value.trim() === '') {
        campo.classList.add('invalido');
        if (msgErro) msgErro.classList.add('visivel');
        valido = false;
      } else {
        campo.classList.remove('invalido');
        if (msgErro) msgErro.classList.remove('visivel');
      }
    });

    // Ao menos um serviço marcado
    var erroServicos = document.getElementById('error-servicos');
    if (formulario.querySelectorAll('input[name="servicos"]:checked').length === 0) {
      erroServicos.classList.add('visivel');
      valido = false;
    } else {
      erroServicos.classList.remove('visivel');
    }

    return valido;
  }

  /* ============================================================
     COLETA DE CHECKBOXES
     ============================================================ */
  function coletarCheckboxes(nome) {
    var valores = [];
    formulario.querySelectorAll('input[name="' + nome + '"]:checked').forEach(function (cb) {
      valores.push(cb.value);
    });
    return valores.length > 0 ? valores.join(', ') : '—';
  }

  /* ============================================================
     ENVIO
     ============================================================ */
  function enviarFormulario() {

    var dados = {
      // Seção 1 — Identificação
      'Nome do responsável': document.getElementById('nome_cliente').value.trim(),
      'Nome da agência':     document.getElementById('nome_agencia').value.trim(),

      // Seção 2 — Serviços
      'Serviços oferecidos': coletarCheckboxes('servicos'),
      'Outros serviços':     document.getElementById('outros_servicos').value.trim() || '—',

      // Seção 3 — Funcionalidades por perfil
      'Funcionalidades — ADM':         coletarCheckboxes('func_adm'),
      'Funcionalidades — Funcionário': coletarCheckboxes('func_funcionario'),
      'Funcionalidades — Cliente':     coletarCheckboxes('func_cliente'),

      // Seção 4 — Banco de dados
      'Dados do cliente a armazenar': coletarCheckboxes('dados_cliente'),

      // Seção 5 — Site
      'Seções do site': coletarCheckboxes('secoes_site')
    };

    // Estado de carregamento
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    btnEnviar.disabled = true;

    fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dados)
    })
    .then(function (resposta) {
      return resposta.json().then(function (corpo) {
        return { status: resposta.status, corpo: corpo };
      });
    })
    .then(function (resultado) {
      if (resultado.status === 200 || resultado.status === 201) {
        formulario.classList.add('hidden');
        mensagemSucesso.classList.remove('hidden');
      } else {
        throw new Error('Erro no envio: ' + resultado.status);
      }
    })
    .catch(function (erro) {
      console.error('Falha no envio:', erro);
      alert('Ocorreu um erro ao enviar o formulário. Verifique sua conexão e tente novamente.');
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      btnEnviar.disabled = false;
    });
  }

  /* ============================================================
     UX: Remove estado de erro ao digitar
     ============================================================ */
  formulario.querySelectorAll('input, select, textarea').forEach(function (campo) {
    campo.addEventListener('input', function () {
      campo.classList.remove('invalido');
      var msgErro = campo.parentElement.querySelector('.error-msg');
      if (msgErro) msgErro.classList.remove('visivel');
    });
  });

}); // fim DOMContentLoaded
