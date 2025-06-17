import { useState } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import { updateCliente } from '../../../shared/services/clienteService';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEmail from '../../../assets/svgs/icons/IconoEmail';
import IconoPassword from '../../../assets/svgs/icons/IconoPassword';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const MiCuenta = () => {
  const { user, setUser } = useUser();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const updated = await updateCliente(user.id, { email: newEmail });
      setUser(updated);
      setIsEditingEmail(false);
      setError('');
    } catch (err) {
      setError('Error al actualizar el email');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar que tenga mayúscula, minúscula y símbolo
    const hasUpperCase = /[A-Z]/.test(passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordForm.newPassword);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasSymbol) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un símbolo');
      return;
    }

    try {
      const updated = await updateCliente(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setUser(updated);
      setIsEditingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
    } catch (err) {
      setError('Error al actualizar la contraseña');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Mi Cuenta</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Email Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <IconoEmail className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Email</h3>
          </div>
          <button
            onClick={() => setIsEditingEmail(!isEditingEmail)}
            className="text-primary hover:text-primarydark"
          >
            <IconoEditar className="w-5 h-5" />
          </button>
        </div>

        {isEditingEmail ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nuevo email"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primarydark"
              >
                Guardar
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">{user?.email}</p>
        )}
      </div>

      {/* Password Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <IconoPassword className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Contraseña</h3>
          </div>
          <button
            onClick={() => setIsEditingPassword(!isEditingPassword)}
            className="text-primary hover:text-primarydark"
          >
            <IconoEditar className="w-5 h-5" />
          </button>
        </div>

        {isEditingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contraseña actual"
              required
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nueva contraseña"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirmar nueva contraseña"
              required
            />
            <p className="text-sm text-gray-500">
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un
              símbolo
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingPassword(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primarydark"
              >
                Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
