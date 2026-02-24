
import { IncomingMessage, ServerResponse } from "node:http";


interface CreationCredentials
{
    id: number,
    usernameInput: string,
    email : string,
    phone: number,
    password: string,
    pasword_require: string,
    submit: string,
    recaotchaToken: string

}


async function Authentific(request: IncomingMessage, response: ServerResponse): Promise<void>{



    if(request.method){
        console.log("teste do backend de criacao de credencial . . . ");
        response.statusCode = 404;
    }


    try {
        const data: CreationCredentials = JSON.parse("");
        console.log('Body recebido: ', data);
        //const { email, password} = data;
    } catch (error) {
        
    }
}

export default Authentific;
