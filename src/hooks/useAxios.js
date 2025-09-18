import axios from "axios";
import { useMemo } from "react";
import useAuthContext from "./useAuthContext";
import { useNavigate } from "react-router-dom";

function useAxios() {

    const { logout } = useAuthContext();

    const navigate = useNavigate();

    const api = useMemo(() => {

        //cria uma instância do axios e configura todas as requisições que serão feitas no front-end.
        const instance = axios.create({
            baseURL: "https://nutriveg-backend.vercel.app/", //url base do back-end (parte da url que não inclui as rotas)
        });

        //o interceptors.request serve para interceptar todas as requisições feitas pelo front antes que elas sejam enviadas ao back.
        //isso significa que antes de toda requisição ser enviada será verificado se o token está disponível, ou seja, se ele está 
        //armazenado no localStorage, caso ele esteja ele será adicionado ao atributo "Authorization" do cabeçalho da requisição.
        instance.interceptors.request.use(async config => {
            const token = localStorage.getItem("jwtToken");
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            };
            return config;
        });

        //o interceptors.response serve para interceptar todas as respostas do back-end.
        instance.interceptors.response.use(
            //se a resposta não tiver nenhum erro, ela apenas será retornada normalmente.
            (response) => {
                return response;
            },
    
            //caso exista um erro na resposta:
            (error) => {
                //se o status da resposta for 401 (não autorizado),
                //significa que o token expirou e não é mais válido,
                //portanto o token será removido e o usuário será redirecionado para a tela de login
                if(error.response?.status === 401) {
                    logout();
                    alert("Sua sessão expirou. Por favor, faça login novamente.");
                    navigate("/entrar", { replace: true });
                };

                //se o status da resposta for 403 (proibido),
                //significa que o usuário não tem  permissão para acessar a funcionalidade.
                //nesse caso, o usuário será desconectado e redirecionado para a tela de login.
                if(error.response?.status === 403 && error.response?.data?.message === "Acesso negado! Apenas nutricionistas têm permissão para realizar esta ação.") {
                    logout();
                    alert("Você não tem permissão para acessar essa funcionalidade.");
                    navigate("/entrar", { replace: true });
                };

                //se não for um erro 401 ou 403, rejeita o erro para ser tratado no catch da requisição.
                return Promise.reject(error);
            }
        );

        return instance; //retorna a instância configurada do axios para uso em outras partes do código.

    }, [logout]);

    return api;

};

export default useAxios;