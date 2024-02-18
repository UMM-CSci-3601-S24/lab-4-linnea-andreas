package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
//import static com.mongodb.client.model.Filters.regex;

// import java.nio.charset.StandardCharsets;
// import java.security.MessageDigest;
// import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
// import java.util.Map;
import java.util.Objects;
// import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
//import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

public class TodoController implements Controller{

  private static final String API_TODOS = "/api/todos";
  private static final String API_TODO_BY_ID = "/api/todos/{id}";
  static final String SORT_ORDER_KEY = "sortorder";
  static final String STATUS_KEY = "status";

  private final JacksonMongoCollection<Todo> todoCollection;

   /**
   * Construct a controller for todos.
   *
   * @param database the database containing todo data
   */
  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(
      database,
      "todos",
      Todo.class,
      UuidRepresentation.STANDARD);
  }
  /**
   * Set the JSON body of the response to be the single user
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if(todo == null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
      ctx.status(HttpStatus.OK);
    }
}

  /**
   * Set the JSON body of the response to be a list of all the todos returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */

public void getTodos(Context ctx) {
  Bson combinedFilter = constructFilter(ctx);
  Bson sortingOrder = constructSortingOrder(ctx);

  ArrayList<Todo> matchingTodos = todoCollection
  .find(combinedFilter)
  .sort(sortingOrder)
  .into(new ArrayList<>());

  ctx.json(matchingTodos);
  ctx.status(HttpStatus.OK);
}

private Bson constructFilter(Context ctx) {
  List<Bson> filters = new ArrayList<>();

  if(ctx.queryParamMap().containsKey(STATUS_KEY)) {
    boolean targetStatus = ctx.queryParamAsClass(STATUS_KEY, Boolean.class)
    .get();
    filters.add(eq(STATUS_KEY, targetStatus));
  }
  Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

  return combinedFilter;

}
private Bson constructSortingOrder(Context ctx) {
  // Sort the results. Use the `sortby` query param (default "name")
  // as the field to sort by, and the query param `sortorder` (default
  // "asc") to specify the sort order.
  String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "owner");
  String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
  Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
  return sortingOrder;
}

public void addRoutes(Javalin server) {
  // Get the specified user
  server.get(API_TODO_BY_ID, this::getTodo);

  // List users, filtered using query parameters
  server.get(API_TODOS, this::getTodos);
}
}
