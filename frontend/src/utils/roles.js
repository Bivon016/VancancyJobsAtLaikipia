export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CPSB_ADMIN: 'CPSB_ADMIN',
  DEPT_HEAD: 'DEPT_HEAD',
  HR_OFFICER: 'HR_OFFICER',
  PANEL_MEMBER: 'PANEL_MEMBER',
  APPLICANT: 'APPLICANT',
};

export const normalizeRole = (role) => {
  if (!role) return null;
  return role.replace(/^ROLE_/, '');
};

export const isApplicant = (role) => normalizeRole(role) === ROLES.APPLICANT;

export const isAdminRole = (role) => {
  const r = normalizeRole(role);
  return r && r !== ROLES.APPLICANT;
};

export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.CPSB_ADMIN,
  ROLES.DEPT_HEAD,
  ROLES.HR_OFFICER,
  ROLES.PANEL_MEMBER,
];

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  CPSB_ADMIN: 'CPSB Admin',
  DEPT_HEAD: 'Department Head',
  HR_OFFICER: 'HR Officer',
  PANEL_MEMBER: 'Panel Member',
  APPLICANT: 'Applicant',
};
