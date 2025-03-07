export const handleError = (error) => {
    console.error(error); // Registra o erro no console
    throw error; // Propaga o erro para que ele possa ser tratado em outro lugar, se necessário
};