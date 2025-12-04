import React from "react";

/**
 * Composant carte de statistique admin
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur à afficher
 * @param {string} icon - Élément JSX pour l'icône (optionnel)
 * @param {string} description - Description courte (optionnel)
 * @param {string} color - Couleur de fond (optionnel, ex: bg-blue-100)
 */
const StatsCard = ({ title, value, icon, description, color = "bg-white" }) => {
	return (
		<div className={`rounded-lg shadow p-5 flex items-center gap-4 ${color}`}>
			{icon && (
				<div className="text-3xl text-blue-500 bg-blue-100 rounded-full p-3">
					{icon}
				</div>
			)}
			<div>
				<div className="text-sm text-gray-500 font-medium">{title}</div>
				<div className="text-2xl font-bold text-gray-800">{value}</div>
				{description && (
					<div className="text-xs text-gray-400 mt-1">{description}</div>
				)}
			</div>
		</div>
	);
};

export default StatsCard;
