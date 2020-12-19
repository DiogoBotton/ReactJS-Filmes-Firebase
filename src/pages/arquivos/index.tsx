import React, { useState, useEffect } from 'react';
import Header from '../../components/header/index';
import Footer from '../../components/footer/index';
import Button from '../../components/button/index';
import Files from '../../assets/images/files.png'
import Refresh from '../../assets/images/refresh.png'
import Trash from '../../assets/images/trash.png'
import { Form, Toast } from 'react-bootstrap';
import './style.css'

import { CircularProgressbar } from 'react-circular-progressbar';
import { MdCheckCircle, MdError, MdLink } from 'react-icons/md';

// Firestore (database do firebase)
import { db, storage } from '../../utils/firebaseConfig';

function Arquivos() {
    const [arquivo, setArquivo] = useState<any>(null);
    const [idArquivo, setIdArquivo] = useState(0);
    const [arquivos, setArquivos] = useState<any>([]);

    const [fileInvalid, setFileValid] = useState(false);


    // Monitoramento de upload
    const [show, setShow] = useState(true);

    const toggleShow = () => setShow(!show);

    const [progressBar, setProgressBar] = useState(0);

    const [uploadStatus, setUploadStatus] = useState('');

    // Status de upload
    const [successUpload, setSuccessUpload] = useState(false);
    const [errorUpload, setErrorUpload] = useState(false);

    const limparCampos = () => {
        setErrorUpload(false);
        setSuccessUpload(false);
        setUploadStatus('');
        setProgressBar(0);
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
            console.log(progressBar + '%')

            // Monitora o status do envio
            switch (snapshot.state) {
                case storage.TaskState.CANCELED:
                    console.log('Upload cancelado.')
                    setUploadStatus('Upload Cancelado.')
                    break;
                case storage.TaskState.RUNNING:
                    console.log('Upload em andamento.')
                    setUploadStatus('Upload em andamento.')
                    break;
                case storage.TaskState.PAUSED:
                    console.log('Upload pausado.')
                    setUploadStatus('Upload pausado.')
                    break;
            }
            // Caso houver algum erro no envio
        }, err => {
            setErrorUpload(true);
            switch (err.code) {
                case 'storage/unauthorized':
                    console.log('Upload não autorizado.')
                    setUploadStatus('Upload não autorizado.')
                    break;
                case 'storage/canceled':
                    console.log('Upload cancelado.')
                    break;
                case 'storage/unknown':
                    console.log('Erro desconhecido no upload do arquivo.')
                    setUploadStatus('Erro desconhecido no upload do arquivo.')
                    break;
            }
            // Caso ocorra tudo certo, função para resgatar a URL de download
        }, function () {
            uploadTask.snapshot.ref.getDownloadURL()
                .then(downloadURL => {
                    console.log('Download disponível em: ' + downloadURL);
                    setUploadStatus('Enviado')
                    setSuccessUpload(true);
                })
                .catch(err => {
                    console.log('Houve um erro ao resgatar a URL de download.')
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

    // Listagem dos arquivos
    const arquivosRender = () => {
        return (
            <tbody>
                {
                    // Listando ITENS com TYPESCRIPT (arquivo recebe QUALQUER item, necessário para reconhecer as props)
                    arquivos.map((arquivo: any) => {
                        return (
                            // Linha com o ID do arquivo
                            <tr key={arquivo.id}>
                                <td>{arquivo.nome}</td>
                                <td className="acts">
                                    <img src={Refresh} alt="Refresh" className="icon" onClick={() => download(arquivo.id)} />
                                    <img src={Trash} alt="Trash" className="icon" onClick={() => trash(arquivo.id)} /></td>
                            </tr>
                        );
                    })
                }
            </tbody>
        );
    }

    return (
        <div className="arqs">
            <Header description="Arquivos" />

            <h1>Arquivos</h1>
            <div className="img-theater">
                <img src={Files} alt="Arquivos" />
            </div>

            <h3>Lista de Arquivos</h3>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead className="thead-cor">
                        <tr>
                            <th scope="col">Arquivo</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    {arquivosRender()}
                </table>

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
            </div>
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
