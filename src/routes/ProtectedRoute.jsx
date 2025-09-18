import { useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";
import { useEffect } from "react";

function ProtectedRoutes({ children, requiredRole }) {
    const { isAuthenticated, user } = useAuthContext();
    const navigate = useNavigate();

    //sempre que isAuthenticated, navigate, user e requiredRole sofrerem alguma alteração o useEffect será executado.
    //{ replace: true } reseta o histórico de navegação, fazendo com que o usuário não consiga
    //acessar a página que ele estava acessando antes do redirecionamento.
    useEffect(() => {
        if(!isAuthenticated || (requiredRole && user?.type !== requiredRole)) {
            navigate("/", { replace: true });
        };
    }, [isAuthenticated, navigate, user, requiredRole]);

    //caso o usuário passe pelas validações ele poderá acessar as rotas privadas.
    return children;
};

export default ProtectedRoutes;