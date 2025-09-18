import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "../components/AppLayout/AppLayout";
import HomePage from "../pages/HomePage";
import SignUpPage from "../pages/SignUpPage";
import LoginPage from "../pages/LoginPage";
import RecipesPage from "../pages/RecipesPage";
import RecipeOverviewPage from "../pages/RecipeOverviewPage";
import CreateRecipePage from "../pages/CreateRecipePage";
import ArticlesPage from "../pages/ArticlesPage";
import ArticleOverviewPage from "../pages/ArticleOverviewPage";
import CreateArticlePage from "../pages/CreateArticlePage";
import NutritionistsPage from "../pages/NutritionistsPage";
import ProfilePage from "../pages/ProfilePage";
import ProfileEditPage from "../pages/ProfileEditPage";
import PageNotFound from "../pages/PageNotFound";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: "/",
                element: (
                    <>
                        <ScrollToTop />
                        <HomePage />
                    </>
                ) 
            },
        
            {
                path: "/criar-conta",
                element: (
                    <>
                        <ScrollToTop />
                        <SignUpPage />
                    </>
                ) 
            },
        
            {
                path: "/entrar",
                element: (
                    <>
                        <ScrollToTop />
                        <LoginPage />
                    </>
                ) 
            },
        
            {
                path: "/receitas",
                element: (
                    <>
                        <ScrollToTop />
                        <RecipesPage />
                    </>
                ) 
            },
        
            {
                path: "/receitas/:id",
                element: (
                    <>
                        <ScrollToTop />
                        <RecipeOverviewPage />
                    </>
                ) 
            },
        
            {
                path: "/criar-receita",
                element: (
                    <>
                        <ScrollToTop />
                        <ProtectedRoute>
                            <CreateRecipePage />
                        </ProtectedRoute>
                    </>
                ) 
            },
        
            {
                path: "/artigos",
                element: (
                    <>
                        <ScrollToTop />
                        <ArticlesPage />
                    </>
                ) 
            },
        
            {
                path: "artigos/:id",
                element: (
                    <>
                        <ScrollToTop />
                        <ArticleOverviewPage />
                    </>
                ) 
            },
        
            {
                path: "/criar-artigo",
                element: (
                    <>
                        <ScrollToTop />
                        <ProtectedRoute requiredRole="nutricionista">
                            <CreateArticlePage />
                        </ProtectedRoute>
                    </>
                ) 
            },
        
            {
                path: "/nutricionistas",
                element: (
                    <>
                        <ScrollToTop />
                        <NutritionistsPage />
                    </>
                ) 
            },
        
            {
                path: "/perfil/:id",
                element: (
                    <>
                        <ScrollToTop />
                        <ProfilePage />
                    </>
                ) 
            },
        
            {
                path: "/editar-perfil/:id",
                element: (
                    <>
                        <ScrollToTop />
                        <ProtectedRoute>
                            <ProfileEditPage />
                        </ProtectedRoute>
                    </>
                ) 
            },
        
            //rota catch-all para páginas não encontradas
            {
                path: "*",
                element: (
                    <>
                        <ScrollToTop />
                        <PageNotFound />
                    </>
                ) 
            }
        ]
    }
]);

function AppRoutes() {
    return <RouterProvider router={router} />
};

export default AppRoutes;