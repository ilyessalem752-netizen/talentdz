export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-4">
        
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Utilisateurs
          </h2>
          <p className="text-3xl mt-2">120</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Offres
          </h2>
          <p className="text-3xl mt-2">45</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Entreprises
          </h2>
          <p className="text-3xl mt-2">12</p>
        </div>

      </div>
    </div>
  );
}