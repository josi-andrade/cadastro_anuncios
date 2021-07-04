

document.getElementById("filtro_periodo").style.display = 'none'
document.getElementById("tela_relatorio").style.display = 'none'
var dIni = document.getElementById("dIni")
var dFin = document.getElementById("dFin")

getItems()

function toggleTabs(v) {

    if (v == 0) {
        document.getElementById("tela_cadastro").style.display = 'block'
        document.getElementById("tela_relatorio").style.display = 'none'
        document.getElementById("tab_cad").classList.add("active")
        document.getElementById("tab_rel").classList.remove("active")
        return
    } else if (v == 1) {
        document.getElementById("tela_cadastro").style.display = 'none'
        document.getElementById("tela_relatorio").style.display = 'block'
        document.getElementById("tab_cad").classList.remove("active")
        document.getElementById("tab_rel").classList.add("active")
        return
    }
}

function toggleFilter(v) {

    dIni.value = ""
    dFin.value = ""

    if (v.value == "cliente") {
        document.getElementById("filtro_cliente").style.display = 'block'
        document.getElementById("filtro_periodo").style.display = 'none'
        return
    } else {
        document.getElementById("filtro_cliente").style.display = 'none'
        document.getElementById("filtro_periodo").style.display = 'block'
    }
}

function salvarAnuncio() {

    var anuncio = document.getElementById("anuncio")
    var cliente = document.getElementById("cliente")
    var data_inicio = document.getElementById("data-inicio")
    var data_termino = document.getElementById("data-termino")
    var valor = document.getElementById("invest-diario")

    if (anuncio.value == "") {
        return msg('Preencha o campo Nome do Anúncio!', anuncio)
    }
    if (cliente.value == "") {
        return msg('Preencha o campo Cliente!', cliente)
    }
    if (parseInt(valor.value) <= 0 || valor.value == "") {
        return msg('Preencha o campo Valor!', valor)
    }
    if (data_inicio.value == "") {
        return msg('Preencha o campo Data Início!', data_inicio)
    }
    if (data_termino.value == "") {
        return msg('Preencha o campo Data Término!', data_termino)
    }
    if (moment(data_inicio.value).format('x') > moment(data_termino.value).format('x')) {
        return msg('A data de início deve ser menor que a data de termino', data_termino)
    }

    dias = moment.duration(moment(data_termino.value).diff(moment(data_inicio.value))).asDays()

    // Se a Data Inicio for igual a Data Término consideramos 1 dia.
    dias == 0 ? dias = 1 : dias = dias

    total_investido = parseInt(valor.value) * dias
    views = total_investido * 30
    clicks = (views * 0.12)
    shares = (clicks * 0.15)
    views_total = ((shares * 40) * 4) + views

    msg()

    var data = {
        "id": Math.random().toString(36).slice(-5),
        "nome_anuncio": anuncio.value,
        "nome_cliente": cliente.value,
        "invest_diario": valor.value,
        "data_inicio": data_inicio.value,
        "data_termino": data_termino.value,
        "views_total": views_total,
        "clicks": clicks,
        "shares": shares,
        "total_investido": total_investido
    }
    if (data.id == "") {
        return msg('Erro ao obter o ID do cadastro!')
    }

    save(data)
}

function save(data) {
    dIni.value = ""
    dFin.value = ""
    var db = window.localStorage
    var anuncios = JSON.parse(db.getItem('ANUNCIOS'))
    var item = []
    if (anuncios != null) {
        item = anuncios
    }
    item.push(data)
    db.setItem('ANUNCIOS', JSON.stringify(item))
    getItems()
    document.getElementById("form_cadastro").reset()
    swal({
        text: "Anúncio cadastrado com Sucesso!",
        icon: "success"
    })
}

function getItems(cliente) {

    var db = window.localStorage
    var linha = ""
    var results = JSON.parse(db.getItem('ANUNCIOS'))

    if (results == null) {
        document.getElementById("result").innerHTML = '<tr><td colspan="11">Nenhum registro encontrado!</td></tr>'
        db.removeItem('ANUNCIOS')
        return
    }

    if (cliente != undefined) {
        results = results.filter(function (v) {
            return v.nome_cliente.toUpperCase().includes(cliente.toUpperCase())
        })
    } else if (dIni.value != "" && dFin.value != "") {
        if (moment(dIni.value).format('x') > moment(dFin.value).format('x')) {
            swal({
                text: "A data de início deve ser menor que a data de término!",
                icon: "warning"
            })
            dFin.focus()
            return
        }
        results = results.filter(function (v) {
            return v.data_inicio >= dIni.value && v.data_termino <= dFin.value
        })
    }
    console.log(results)
    if (results.length == 0) {
        document.getElementById("result").innerHTML = '<tr><td colspan="11">Nenhum registro corresponde a sua busca!</td></tr>'
        return
    }

    results.forEach(function (value, index) {
        linha += '<tr>'
        linha += '<th scope="row"> ' + value['id'] + '</th>'
        linha += '<td>' + value['nome_cliente'] + '</td>'
        linha += '<td>' + value['nome_anuncio'] + '</td>'
        linha += '<td>' + moment(value['data_inicio']).format('DD/MM/YYYY') + '</td>'
        linha += '<td>' + moment(value['data_termino']).format('DD/MM/YYYY') + '</td>'
        linha += '<td>' + Math.ceil(value['views_total']) + '</td>'
        linha += '<td>' + Math.ceil(value['clicks']) + '</td>'
        linha += '<td>' + Math.ceil(value['shares']) + '</td>'
        linha += '<td>R$ ' + value['invest_diario'] + '.00</td>'
        linha += '<td>R$ ' + value['total_investido'] + '.00</td>'
        linha += '<td><a href="javascript:excluir(' + index + ')"><i class="fa fa-trash text-danger"></i></a></td>'
        linha += '</tr>'
    })
    document.getElementById("result").innerHTML = linha

}

function msg(txt, el) {
    if (txt != null && txt != "") {
        document.getElementById("mensagem").innerHTML = '<div class="alert alert-danger py-2 px-2 mt-3" role="alert" style="font-size: 12px">' + txt + '</div>'
        el.focus()
        return false
    } else {
        document.getElementById("mensagem").innerHTML = ''
    }

}

function excluir(id) {

    swal({
        text: "Deseja excluir esse registro?",
        icon: "warning",
        buttons: [{
            text: "Cancelar",
            value: null,
            visible: true,
            className: "",
            closeModal: true,
        }, {
            text: "Excluir",
            value: true,
            visible: true,
            className: "",
            closeModal: true
        }],
        dangerMode: true,
    }).then((res) => {
        if (res) {

            var db = window.localStorage
            var anuncios = JSON.parse(db.getItem('ANUNCIOS'))
            anuncios.splice(id, 1)

            db.setItem('ANUNCIOS', JSON.stringify(anuncios))
            getItems()

        }

    })

}