import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    designation: '',
    phone: '',
    address: '',
    managerId: '',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (department) params.department = department;
      if (status) params.status = status;

      const res = await api.get('/employees', { params });
      setEmployees(res.data.data || []);
      setPage(res.data.page || 1);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const res = await api.get('/managers');
      setManagers(res.data.data || []);
    } catch (err) {
      // Handled silently
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, search, department, status]);

  useEffect(() => {
    loadManagers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setActiveEmployeeId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: 'Engineering',
      designation: '',
      phone: '',
      address: '',
      managerId: '',
      status: 'Active'
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setModalMode('edit');
    setActiveEmployeeId(emp._id);
    setFormData({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      password: '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.phone || '',
      address: emp.address || '',
      managerId: emp.manager?._id || '',
      status: emp.status || 'Active'
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      if (modalMode === 'create') {
        await api.post('/employees', formData);
      } else {
        await api.put(`/employees/${activeEmployeeId}`, formData);
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        loadEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to deactivate employee');
      }
    }
  };

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{ width: 34, height: 34, fontSize: 13 }}>
            {row.user?.name?.charAt(0) || 'E'}
          </div>
          <div>
            <div className="fw-semibold text-dark">{row.user?.name}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{row.user?.email}</div>
          </div>
        </div>
      )
    },
    { header: 'ID', accessor: 'employeeId', render: (row) => <span className="tabular-nums fw-medium">{row.employeeId}</span> },
    { header: 'Department', accessor: 'department' },
    { header: 'Designation', accessor: 'designation' },
    {
      header: 'Manager',
      render: (row) => (
        <span className="small text-muted">{row.manager?.user?.name || 'Unassigned'}</span>
      )
    },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="d-flex justify-content-end gap-1">
          <button
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Edit Details"
            onClick={() => openEditModal(row)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          {row.status === 'Active' && (
            <button
              className="btn btn-sm btn-outline-danger py-1 px-2"
              title="Deactivate"
              onClick={() => handleDeactivate(row._id)}
            >
              <i className="bi bi-person-x"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Employee & Manager Directory</h4>
          <p className="text-secondary small mb-0">Manage personnel records, organizational hierarchy, and account activations.</p>
        </div>
        <div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openCreateModal}>
            <i className="bi bi-person-plus"></i> Add New Employee
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        page={page}
        pages={pages}
        total={total}
        onPageChange={setPage}
        searchPlaceholder="Search by name, email, or employee ID..."
        searchTerm={search}
        onSearchChange={setSearch}
        filterComponent={
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        }
        emptyTitle="No employees found"
        emptyMessage="Try adjusting your search filters or add a new team member."
      />

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-3 p-3">
          <div className="card shadow-lg border-1 w-100" style={{ maxWidth: 560 }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">
                {modalMode === 'create' ? 'Add New Organization Member' : 'Edit Employee Record'}
              </h6>
              <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3">
              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}
                </div>
              )}
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empName">Full Name</label>
                  <input
                    id="empName"
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empEmail">Work Email</label>
                  <input
                    id="empEmail"
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={modalMode === 'edit'}
                    required
                  />
                </div>
              </div>

              {modalMode === 'create' && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="empPass">Temporary Password</label>
                  <input
                    id="empPass"
                    type="password"
                    className="form-control"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empDept">Department</label>
                  <input
                    id="empDept"
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empDesig">Designation</label>
                  <input
                    id="empDesig"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Frontend Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empMgr">Assign Manager</label>
                  <select
                    id="empMgr"
                    className="form-select"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  >
                    <option value="">No Manager Assigned</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.user?.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="empStatus">Status</label>
                  <select
                    id="empStatus"
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>{modalMode === 'create' ? 'Create Employee' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
