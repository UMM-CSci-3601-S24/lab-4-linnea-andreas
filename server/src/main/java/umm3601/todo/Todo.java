package umm3601.todo;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Todo {
  @ObjectId @Id
  // By default Java field names shouldn't start with underscores.
  // Here, though, we *have* to use the name `_id` to match the
  // name of the field as used by MongoDB.
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String owner;
  public boolean status;
  public String body;
  public String category;
  public String avatar;


  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof Todo)) {
      return false;
    }
    Todo other = (Todo) obj;
    return _id.equals(other._id);
  }

  @Override
  public int hashCode() {
    // This means that equal Users will hash the same, which is good.
    return _id.hashCode();
  }
}
