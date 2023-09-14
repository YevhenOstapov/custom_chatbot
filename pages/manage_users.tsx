import supabaseClient from "@/lib/supabaseClient";

export default function UsersPage({ users }) {
  async function handleEnrollSms(userId) {
    const response = await fetch("/api/enroll_sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (response.ok) {
      // Reload the page to show the updated feature status
      location.reload();
    } else {
      // Handle error
      console.error("Failed to enroll user in SMS feature");
    }
  }

  return (
    <div>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>SMS Enrollment</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.email}</td>
                <td>{user.phone_number}</td>
                <td>
                  {user.enrolled_sms
                    ? "Enrolled"
                    : user.phone_number && (
                        <button onClick={() => handleEnrollSms(user.id)}>
                          Enroll SMS
                        </button>
                      )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: users, error } = await supabaseClient.from("profiles").select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      enrolled_sms
    `);

  if (error) {
    console.error(error);
    return { props: {} };
  }

  return { props: { users } };
}
