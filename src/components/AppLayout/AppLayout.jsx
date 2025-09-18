import { Outlet } from "react-router-dom";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

//esse componente define a estrutura principal (layout) da aplicação,
//garantindo que a Header e o Footer sejam exibidos em todas as páginas.
//o conteúdo específico de cada rota será inserido no lugar do Outlet.
function AppLayout() {
    return(
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default AppLayout;