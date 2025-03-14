//react
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar o usuário

//API
import { API_URL } from '../../services/apiConfig'; // Importe a URL da API

//Icons
import piratinha from "../../assets/piratinha.png"
import { BsCart2 } from "react-icons/bs";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import { HiOutlineBars3 } from "react-icons/hi2";
import LogoutIcon from "@mui/icons-material/Logout"; // Ícone para o logout
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useAuth } from '../../context/AuthContext'; // Importe o hook useAuth

const Navbar = () => {
    const [openMenu, setOpenMenu] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useAuth(); // Use o contexto de autenticação
    const navigate = useNavigate();

    // Verifica se o usuário está autenticado ao carregar o componente
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/check-auth`, {
                    credentials: 'include', // Inclui cookies na requisição
                });

                // Verifica se a resposta foi bem-sucedida
                if (!response.ok) {
                    throw new Error('Erro ao verificar autenticação');
                }

                const data = await response.json();
                if (data.authenticated) {
                    setIsAuthenticated(true); // Atualiza o estado de autenticação
                } else {
                    setIsAuthenticated(false); // Define como não autenticado
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                setIsAuthenticated(false); // Define como não autenticado em caso de erro
            }
        };

        checkAuth();
    }, [setIsAuthenticated]); // Adiciona setIsAuthenticated como dependência

    // Função para fazer logout
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include', // Inclui cookies na requisição
            });
            if (response.ok) {
                setIsAuthenticated(false);
                localStorage.removeItem('tipo_usuario');
                localStorage.removeItem('id_usuario');
                navigate('/login');
            } else {
                console.error('Erro ao fazer logout:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Opções do menu
    const menuOptions = [
        {
            text: "Home",
            icon: <HomeIcon />,
            path: "/"
        },
        {
            text: "About",
            icon: <InfoIcon />,
            path: "/about"
        },
        {
            text: "Testimonials",
            icon: <CommentRoundedIcon />,
            path: "/testimonials"
        },
        {
            text: "Contact",
            icon: <PhoneRoundedIcon />,
            path: "/contact"
        },
        {
            text: "Cart",
            icon: <ShoppingCartRoundedIcon />,
            path: "/cart"
        }
    ];

    return (
        <nav>
            <div className='nav-logo-container'>
                <img src={piratinha} alt="Logo" />
            </div>
            <div className='navbar-links-container'>
                {menuOptions.map((item) => (
                    <a key={item.text} href={item.path || "#"} onClick={item.onClick}>
                        {item.text}
                    </a>
                ))}
                {/* Botão de logout ao lado do Cart */}
                {isAuthenticated && (
                    <button className='logout-button' onClick={handleLogout}>
                        <LogoutIcon /> Logout
                    </button>
                )}
                <button className='primary-button'>Booking Now</button>
            </div>
            <div className='navbar-menu-container'>
                <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
            </div>
            <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={() => setOpenMenu(false)}
                    onKeyDown={() => setOpenMenu(false)}
                >
                    <List>
                        {menuOptions.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton onClick={item.onClick}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        {/* Adiciona o botão de logout no menu lateral */}
                        {isAuthenticated && (
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                                    <ListItemText primary="Logout" />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>
        </nav>
    );
};

export default Navbar;