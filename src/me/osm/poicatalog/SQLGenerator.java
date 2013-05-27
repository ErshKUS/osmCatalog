package me.osm.poicatalog;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;


public class SQLGenerator {
	
	private static LinkedHashMap<String, JSONObject> name2JSON = new LinkedHashMap<>();
	private static LinkedHashMap<String, CatalogItem> catalog = new LinkedHashMap<>();

	public static void main(String[] args) {
		
		try {
			JSONArray catalogJSON = new JSONArray(new JSONTokener(new FileInputStream(args[0])));
			
			for(int i = 0; i < catalogJSON.length(); i++) {
				JSONObject catalogEntry = catalogJSON.getJSONObject(i);
				name2JSON.put(catalogEntry.getString("name"), catalogEntry);
			}
			
			catalog.put("", new CatalogItem());
			for(Entry<String, JSONObject> entry : name2JSON.entrySet()) {
				parseItem(entry.getValue());
			}
			
			name2JSON.clear();
			
			generateSelects(catalog, args[1]);
			
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
	}

	private static void generateSelects(LinkedHashMap<String, CatalogItem> catalog, String template) {
		List<CatalogItem> sortedCatalogItems = new ArrayList<>(catalog.values());

		//для начала сортируем по количеству тегов, потом среди тех у, 
		//кого тегов больше чем 1 
		Collections.sort(sortedCatalogItems, new Comparator<CatalogItem>() {
			@Override
			public int compare(CatalogItem o1, CatalogItem o2) {
				return o2.getTags().size() - o1.getTags().size();
			}
		});

		Map<String, List<Tag>> tags2Exclude = new HashMap<>();
		for(CatalogItem ci : sortedCatalogItems) {
			if(ci.getTags().size() > 1) {
				
				for(Tag tag : ci.getTags()) {
					if(tags2Exclude.get(tag.toString()) == null) {
						tags2Exclude.put(tag.toString(), new ArrayList<Tag>());
					}
					tags2Exclude.get(tag.toString()).addAll(ci.getTags());
				}
			}
				
			//пока только 1 уточняющий тэг, если станет больше надо для тех у кого 
			//2 тэга (1 уточняющий) проверять не повторяются ли теги среди тех у кого 
			//3 тега (2 уточняющих) 
			addExcludeTags(ci, tags2Exclude);
		}

		for(CatalogItem ci : sortedCatalogItems) {
			for(Tag t : ci.getTags()) {
				Iterator<Tag> i = ci.getExcludeTags().iterator();
				while(i.hasNext()) {
					Tag ti = i.next();
					if(t.getKey().equals(ti.getKey())){
						i.remove();
					}
				}
			}
		}
		
		for(CatalogItem ci : sortedCatalogItems) {
			if(ci.getTags().size() > 0){
				StringBuilder where = new StringBuilder();
				
				for(Tag t : ci.getTags()) {
					where.append("and tags @> '").append(t.getKey()).append("=>").append(t.getValue()).append("'");
				}

				for(Tag t : ci.getExcludeTags()) {
					where.append("and not tags @> '").append(t.getKey()).append("=>").append(t.getValue()).append("'");
				}

				String whereClause = "where " + where.substring(4);
				String result = template.replaceAll("\\{where\\}", whereClause);
				result = result.replaceAll("\\{name\\}", ci.getName());
				
				System.out.println(result);
			}
		}
	}

	/**
	 * Для каждого тега объекта исключаем все уточняющие его теги
	 * */
	private static void addExcludeTags(CatalogItem ci, Map<String, List<Tag>> tags2Exclude) {
		for(Tag tag : ci.getTags()){
			if(tags2Exclude.get(tag.toString()) != null) {
				ci.getExcludeTags().addAll(tags2Exclude.get(tag.toString()));
			}
		}
	}

	private static void parseItem(JSONObject catalogEntry) {
		
		CatalogItem item = new CatalogItem();

		String name = catalogEntry.getString("name");
		item.setName(name);

		JSONObject tags = catalogEntry.getJSONObject("tags");
		Iterator<String> tagKeys = tags.keys();
		while (tagKeys.hasNext()) {
			String tagKey = tagKeys.next();
			item.getTags().add(new Tag(tagKey, tags.getString(tagKey)));
		}
		
		//Добавляем в каталог тут, подстраховываясь от цикла в инициализации родителей
		//Вдруг ктонибудь добавит самого себя в родителеи
		catalog.put(name, item);

		JSONArray parents = catalogEntry.getJSONArray("parent");
		for(int i = 0; i < parents.length(); i++) {
			String parentName = parents.getString(i);
			if(catalog.get(parentName) == null) {
				parseItem(name2JSON.get(name));
			}
		}
		
	}
	
}
