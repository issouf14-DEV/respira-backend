import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function StatsCard({ title, value, change, icon, color = "bg-kia_red" }) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-kia_dark">{value}</h3>
          <p className={`text-sm mt-2 ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {isPositive ? <FaArrowUp className="inline mr-1" size={16} /> : <FaArrowDown className="inline mr-1" size={16} />}
            {Math.abs(change)}% vs mois dernier
          </p>
        </div>
        <div className={`${color} p-4 rounded-full text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}