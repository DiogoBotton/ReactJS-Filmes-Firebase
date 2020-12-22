import React, { useState, useEffect } from 'react';
import Header from '../../components/header/index';
import Footer from '../../components/footer/index';
import Button from '../../components/button/index';
import Files from '../../assets/images/files.png'
import { Form, Toast } from 'react-bootstrap';
import './style.css'

// Formatter
import { niceBytes } from '../../utils/formatter';

// Tabelas
import { DataGrid, ColDef, ValueFormatterParams } from '@material-ui/data-grid';

// Ícones material-ui
import { Delete, CloudDownload, Edit, InsertDriveFile } from '@material-ui/icons';
import { IconButton, Tooltip, Avatar } from '@material-ui/core';

import { CircularProgressbar } from 'react-circular-progressbar';
import { MdCheckCircle, MdError } from 'react-icons/md';

// Firestore (database do firebase)
import { db, storage } from '../../utils/firebaseConfig';

function Arquivos() {
    const [arquivo, setArquivo] = useState<any>(null);

    const [arquivos, setArquivos] = useState<any>([]);

    const [cellSelect, setCellSelect] = useState({});

    const [fileInvalid, setFileValid] = useState(false);

    // Monitoramento de upload
    const [show, setShow] = useState(true);

    const toggleShow = () => setShow(!show);

    const [progressBar, setProgressBar] = useState(0);

    const [uploadStatus, setUploadStatus] = useState('');

    // Status de upload
    const [successUpload, setSuccessUpload] = useState(false);
    const [errorUpload, setErrorUpload] = useState(false);

    useEffect(() => {
        getArquivos();
    }, [])

    const limparCampos = () => {
        setErrorUpload(false);
        setSuccessUpload(false);
        setUploadStatus('');
        setProgressBar(0);
    }

    const getArquivos = async () => {
        // Recupera todos os itens e atualiza a lista em tempo real caso algum documento for alterado
        db.collection('Arquivos').onSnapshot(
            resp => {
                let arqs = resp.docs.map((arq: any) => {
                    return {
                        id: arq.id,
                        path: arq.data().path,
                        nome: arq.data().nome,
                        downloadUrl: arq.data().downloadUrl,
                        tamanho: niceBytes(arq.data().tamanho),
                        contentType: arq.data().contentType,
                        timeCreated: arq.data().timeCreated,
                        timeUploaded: arq.data().timeUploaded,
                    }
                })
                setArquivos(arqs);
            })
    }

    // download 
    const download = (id: number) => {

    }

    // Upload
    const upload = () => {
        if (arquivo == null)
            return alert('Selecione um arquivo válido para enviar.');

        //console.log(arquivo)
        let isImages = false;

        // Verifica se o arquivo contem extensões de uma imagem
        if (arquivo.name.includes('.jpeg') ||
            arquivo.name.includes('.jpg') ||
            arquivo.name.includes('.png') ||
            arquivo.name.includes('.webp') ||
            arquivo.name.includes('.tif') ||
            arquivo.name.includes('.tiff') ||
            arquivo.name.includes('.tiff') ||
            arquivo.name.includes('.svg') ||
            arquivo.name.includes('.gif')
        )
            isImages = true;

        var storageRef = storage().ref();

        // Define se é um arquivo (generalizado) ou uma imagem
        let ref = isImages === true ? 'images' : 'files';

        // Cria a referência para o arquivo que será enviado
        var uploadTask = storageRef.child(ref + `/${arquivo.name}`).put(arquivo);

        // Inicia a tarefa de envio, monitorando seu status
        uploadTask.on(storage.TaskEvent.STATE_CHANGED, snapshot => {
            // Percentual de envio utilizando o número de bytes transferido e total
            setProgressBar((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

            // Monitora o status do envio
            switch (snapshot.state) {
                case storage.TaskState.CANCELED:
                    setUploadStatus('Upload Cancelado.')
                    break;
                case storage.TaskState.RUNNING:
                    setUploadStatus('Upload em andamento.')
                    break;
                case storage.TaskState.PAUSED:
                    setUploadStatus('Upload pausado.')
                    break;
            }
            // Caso houver algum erro no envio
        }, err => {
            setErrorUpload(true);
            switch (err.code) {
                case 'storage/unauthorized':
                    setUploadStatus('Upload não autorizado.')
                    break;
                case 'storage/canceled':
                    console.log('Upload cancelado.')
                    break;
                case 'storage/unknown':
                    setUploadStatus('Erro desconhecido no upload do arquivo.')
                    break;
            }
            // Caso ocorra tudo certo, função para resgatar a URL de download
        }, function () {
            uploadTask.snapshot.ref.getMetadata()
                .then(metaData => {
                    // Cadastra na coleção o arquivo que foi enviado
                    db.collection('Arquivos').doc(metaData.md5Hash).set({
                        path: metaData.fullPath,
                        nome: metaData.name,
                        tamanho: metaData.size,
                        contentType: metaData.contentType,
                        timeCreated: metaData.timeCreated,
                        timeUploaded: metaData.updated,
                    })
                        .catch(err => console.log('Houve um erro na criação do registro do arquivo no FireStore.'))

                    // Recupera a url de download
                    uploadTask.snapshot.ref.getDownloadURL()
                        .then(downloadURL => {
                            // Atualiza o documento para adicionar a url de download
                            db.collection('Arquivos').doc(metaData.md5Hash).update({
                                downloadUrl: downloadURL,
                            })
                                .catch(err => console.log('Houve um erro na atualização do documento no fireStore para adicionar URL de download.'))
                            console.log('Download disponível em: ' + downloadURL);
                            setUploadStatus('Enviado')
                            setSuccessUpload(true);
                        })
                        .catch(err => {
                            console.log('Houve um erro ao resgatar a URL de download.')
                        })
                })
        })
    }

    // Quando clica na imagem de lixo
    const trash = (id: number) => {

    }

    const uploadsMonitoring = () => {
        if (arquivo == null) {
            return (
                <p>Nenhum arquivo em processo de upload.</p>
            )
        }
        else {
            return (
                <div className="monitoring">
                    <div>
                        <strong>{arquivo.name.length > 20 ? arquivo.name.substring(0, 20) + '...' : arquivo.name}</strong>
                    </div>
                    <div>
                        {uploadStatus}
                    </div>
                    <div>
                        {/* Math.round() arredonda o número com várias casas decimais */}
                        {Math.round(progressBar) + '%'}
                        <CircularProgressbar styles={{
                            root: { width: 24 },
                            path: { stroke: "#7159c1" }
                        }} strokeWidth={10} value={progressBar} />
                    </div>
                    {successUpload && <MdCheckCircle size={24} color="#78e5d5" />}
                    {errorUpload && <MdError size={24} color="#e57878" />}
                </div>
            )
        }
    }

    const columns: ColDef[] = [
        {
            field: 'icon',
            headerName: 'Ícone',
            width: 100,
            // Renderizando componentes dentro de cada celula de uma coluna específica
            renderCell: (params: ValueFormatterParams) => (
                params.row.contentType.includes('image') ?
                    <div>
                        {
                            <Avatar alt={params.row.nome} src={params.row.downloadUrl} style={{ width: '2.5em', height: '2.5em'}} />
                        }
                    </div>
                    :
                    <div>
                        {
                            <InsertDriveFile fontSize="large" />
                        }
                    </div>
            )
        },
        { field: 'nome', headerName: 'Nome', width: 200 },
        { field: 'contentType', headerName: 'Tipo', width: 200 },
        { field: 'tamanho', headerName: 'Tamanho', width: 100 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 170,
            renderCell: (params: ValueFormatterParams) => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="Download" onClick={() => { console.log(cellSelect) }}>
                        <IconButton>
                            <CloudDownload />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" onClick={() => { console.log(cellSelect) }}>
                        <IconButton>
                            <Delete />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar" onClick={() => { console.log(cellSelect) }}>
                        <IconButton>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="arqs">
            <Header description="Arquivos" />

            <h1>Arquivos</h1>
            <div className="img-theater">
                <img src={Files} alt="Arquivos" />
            </div>

            <div style={{ marginTop: '3em', marginBottom: '3em' }}>
                <div className="table-container" style={{ height: 400, margin: '0 auto' }}>
                    <DataGrid pagination rows={arquivos} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 25, 50]}
                        onCellClick={cell => {
                            setCellSelect(cell.row);
                        }}
                    />
                </div>
            </div>

            <Form className="form" onSubmit={event => {
                event.preventDefault()
                upload();
            }}>
                <div className="mb-3">
                    <Form.File id="formcheck-api-regular">
                        <Form.File.Label>Arquivo</Form.File.Label>
                        <Form.File.Input isInvalid={fileInvalid} onChange={(e: any) => {
                            setArquivo(e.target.files[0]);
                            limparCampos();
                        }} />
                        <Form.Control.Feedback type="invalid" >Arquivo inválido, apenas arquivos de imagem ou compactados (.rar, .zip)</Form.Control.Feedback>
                    </Form.File>
                </div>
                <div className="btn">
                    <Button name="Upload Arquivo" type="submit" />
                </div>
            </Form>

            <Toast className="monitoringUp" show={show}>
                <Toast.Header>
                    <strong className="mr-auto">Upload's</strong>
                </Toast.Header>
                <Toast.Body>
                    {uploadsMonitoring()}
                </Toast.Body>
            </Toast>
            <Footer />
        </div>
    );
}

export default Arquivos;
