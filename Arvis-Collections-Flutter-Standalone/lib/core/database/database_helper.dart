import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  DatabaseHelper._internal();

  static DatabaseHelper get instance => _instance;

  Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'arvis_collections.db');
    
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDatabase,
      onUpgrade: _upgradeDatabase,
    );
  }

  Future<void> _createDatabase(Database db, int version) async {
    // Users table
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        is_active INTEGER DEFAULT 1,
        avatar_path TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // Categories table
    await db.execute('''
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        image_path TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    ''');

    // Products table
    await db.execute('''
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        compare_price REAL,
        category_id INTEGER,
        brand TEXT,
        sku TEXT UNIQUE,
        stock_quantity INTEGER DEFAULT 0,
        sizes TEXT, -- JSON array
        colors TEXT, -- JSON array
        tags TEXT, -- JSON array
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    ''');

    // Product images table
    await db.execute('''
      CREATE TABLE product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    ''');

    // Cart table
    await db.execute('''
      CREATE TABLE cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        size TEXT,
        color TEXT,
        price REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id, size, color)
      )
    ''');

    // Orders table
    await db.execute('''
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
        subtotal REAL NOT NULL,
        tax_amount REAL DEFAULT 0,
        shipping_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        shipping_address TEXT, -- JSON object
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    ''');

    // Order items table
    await db.execute('''
      CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        size TEXT,
        color TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    ''');

    // Create indexes for better performance
    await db.execute('CREATE INDEX idx_users_email ON users(email)');
    await db.execute('CREATE INDEX idx_products_category ON products(category_id)');
    await db.execute('CREATE INDEX idx_products_active ON products(is_active)');
    await db.execute('CREATE INDEX idx_cart_user ON cart(user_id)');
    await db.execute('CREATE INDEX idx_orders_user ON orders(user_id)');

    // Insert default admin user
    await _insertDefaultData(db);
  }

  Future<void> _upgradeDatabase(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
    if (oldVersion < newVersion) {
      // Add migration logic here
    }
  }

  Future<void> _insertDefaultData(Database db) async {
    // Create default admin user
    final adminPasswordHash = _hashPassword('Admin@123');
    await db.insert('users', {
      'email': 'admin@arviscollections.com',
      'password_hash': adminPasswordHash,
      'first_name': 'Admin',
      'last_name': 'User',
      'role': 'admin',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    // Create default customer user
    final customerPasswordHash = _hashPassword('Customer@123');
    await db.insert('users', {
      'email': 'customer@example.com',
      'password_hash': customerPasswordHash,
      'first_name': 'John',
      'last_name': 'Doe',
      'role': 'customer',
      'is_active': 1,
      'created_at': DateTime.now().toIso8601String(),
    });

    // Create default categories
    final categories = [
      {'name': 'T-Shirts', 'description': 'Comfortable cotton t-shirts', 'sort_order': 1},
      {'name': 'Jeans', 'description': 'Stylish denim jeans', 'sort_order': 2},
      {'name': 'Shoes', 'description': 'Comfortable footwear', 'sort_order': 3},
      {'name': 'Accessories', 'description': 'Fashion accessories', 'sort_order': 4},
    ];

    for (final category in categories) {
      await db.insert('categories', {
        ...category,
        'is_active': 1,
        'created_at': DateTime.now().toIso8601String(),
      });
    }

    // Create sample products
    await _insertSampleProducts(db);
  }

  Future<void> _insertSampleProducts(Database db) async {
    final sampleProducts = [
      {
        'name': 'Premium Cotton T-Shirt',
        'description': 'High-quality cotton t-shirt perfect for everyday wear. Soft, comfortable, and durable.',
        'price': 29.99,
        'compare_price': 39.99,
        'category_id': 1,
        'brand': 'Arvis Collection',
        'sku': 'AC-TSHIRT-001',
        'stock_quantity': 50,
        'sizes': '["S", "M", "L", "XL"]',
        'colors': '["Black", "White", "Navy", "Gray"]',
        'tags': '["cotton", "casual", "comfortable"]',
        'is_featured': 1,
        'is_active': 1,
      },
      {
        'name': 'Designer Denim Jeans',
        'description': 'Stylish denim jeans with a modern fit. Perfect for casual and semi-formal occasions.',
        'price': 79.99,
        'compare_price': 99.99,
        'category_id': 2,
        'brand': 'Arvis Collection',
        'sku': 'AC-JEANS-001',
        'stock_quantity': 30,
        'sizes': '["28", "30", "32", "34", "36"]',
        'colors': '["Blue", "Black", "Light Blue"]',
        'tags': '["denim", "jeans", "casual"]',
        'is_featured': 1,
        'is_active': 1,
      },
      {
        'name': 'Sport Running Shoes',
        'description': 'Lightweight running shoes designed for comfort and performance. Perfect for daily runs and workouts.',
        'price': 99.99,
        'category_id': 3,
        'brand': 'Arvis Collection',
        'sku': 'AC-SHOES-001',
        'stock_quantity': 25,
        'sizes': '["7", "8", "9", "10", "11"]',
        'colors': '["White", "Black", "Red"]',
        'tags': '["shoes", "running", "sport"]',
        'is_featured': 1,
        'is_active': 1,
      },
      {
        'name': 'Leather Wallet',
        'description': 'Premium leather wallet with multiple card slots and cash compartment.',
        'price': 49.99,
        'category_id': 4,
        'brand': 'Arvis Collection',
        'sku': 'AC-WALLET-001',
        'stock_quantity': 40,
        'sizes': '["One Size"]',
        'colors': '["Brown", "Black"]',
        'tags': '["leather", "wallet", "accessories"]',
        'is_featured': 0,
        'is_active': 1,
      },
      {
        'name': 'Casual Button Shirt',
        'description': 'Versatile button-up shirt suitable for both casual and business casual settings.',
        'price': 59.99,
        'category_id': 1,
        'brand': 'Arvis Collection',
        'sku': 'AC-SHIRT-001',
        'stock_quantity': 35,
        'sizes': '["S", "M", "L", "XL", "XXL"]',
        'colors': '["White", "Blue", "Light Blue", "Gray"]',
        'tags': '["shirt", "casual", "business"]',
        'is_featured': 0,
        'is_active': 1,
      },
    ];

    for (final product in sampleProducts) {
      await db.insert('products', {
        ...product,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
    }
  }

  String _hashPassword(String password) {
    final bytes = utf8.encode(password + 'arvis_salt_2024');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Utility methods for database operations
  Future<List<Map<String, dynamic>>> query(String table, {
    bool? distinct,
    List<String>? columns,
    String? where,
    List<dynamic>? whereArgs,
    String? groupBy,
    String? having,
    String? orderBy,
    int? limit,
    int? offset,
  }) async {
    final db = await database;
    return await db.query(
      table,
      distinct: distinct,
      columns: columns,
      where: where,
      whereArgs: whereArgs,
      groupBy: groupBy,
      having: having,
      orderBy: orderBy,
      limit: limit,
      offset: offset,
    );
  }

  Future<int> insert(String table, Map<String, dynamic> values) async {
    final db = await database;
    return await db.insert(table, values);
  }

  Future<int> update(String table, Map<String, dynamic> values, {
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    final db = await database;
    return await db.update(table, values, where: where, whereArgs: whereArgs);
  }

  Future<int> delete(String table, {
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    final db = await database;
    return await db.delete(table, where: where, whereArgs: whereArgs);
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
  }

  Future<void> deleteDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'arvis_collections.db');
    await databaseFactory.deleteDatabase(path);
    _database = null;
  }
}