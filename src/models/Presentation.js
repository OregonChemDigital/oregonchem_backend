const mongoose = require("mongoose");

const siteSchema = {
    type: String,
    default: ""
};

const PresentationSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: [true, "Presentation name is required"],
            unique: true,
            trim: true
        },
        // Prompt text for AI generation with placeholders
        promptText: {
            type: String,
            required: [true, "Prompt text is required"],
            default: "Edita exclusivamente la zona blanca de la etiqueta del producto, ese espacio vacío en blanco es el único lugar editable; en él agrega el nombre del producto: {producto} y debajo su presentación: {presentación}, con apariencia real de impresión en etiqueta; utiliza tipografía sans-serif moderna (Helvetica/Inter/Roboto o similar), color negro puro (#000000) sin contornos ni efectos, el nombre en seminegrita/medium y la presentación en regular/medium a un 70–80% del tamaño del nombre, alineada a la izquierda; si el nombre es largo divídelo automáticamente en dos líneas en lugar de reducir demasiado el tamaño; mantén márgenes internos del 4–6% para que el texto no se salga del área, aplica ligera curvatura/perspectiva para que ambas líneas sigan la forma cilíndrica del envase y se perciban adheridas a la etiqueta, simulando tinta impresa sin añadir gráficos ni efectos extra, conservando la iluminación, textura y proporciones originales del envase, con resultado nítido, fotorealista y sin artefactos."
        },
        // Base64 template image for AI generation
        templateImage: {
            type: String,
            required: [true, "Template image is required"]
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Presentation = mongoose.model("Presentation", PresentationSchema);
module.exports = Presentation;