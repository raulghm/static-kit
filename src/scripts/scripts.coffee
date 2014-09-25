$('document').ready ->

	# getMultipleTags = (tags) ->
	#   feeds = []
	#   i = 0
	#   len = tags.length

	#   while i < len
	#     feeds.push new Instafeed(
	#       clientId: "fd88310566744275a3d68092d9c175d1"
	#       # rest of your options
	#       get: "tagged"
	#       tagName: tags[i]
	#       target: "feed-" + tags[i]
	#     )
	#     i++
	#   feeds

	# # get multiple tags
	# myTags = getMultipleTags([
	#   "glass"
	#   "wood"
	# ])

	# # run each instance
	# i = 0
	# len = myTags.length

	# setTimeout( ->
	# 	while i < len
	#   	myTags[i].run()
	#   	i++
	# , 1000)

	feed = new Instafeed
	  clientId: "fd88310566744275a3d68092d9c175d1"
	  get: "tagged"
	  tagName: "gap"
	  target: "instafeed-0"
	  resolution: "low_resolution"
	  template: '<div class="item"><a target="_blank" class="item-inner" href="{{link}}" style="background-image:url({{image}});"><div class="footer"><i class="icon fo-instagram"></i> <span class="caption">{{caption}}</span></div></a></div>'

	feed.run()

	$('.load').click ->
		feed.next()

	# feed1 = new Instafeed(
	#   clientId: "fd88310566744275a3d68092d9c175d1"
	#   get: "tagged"
	#   tagName: "banana"
	#   target: "instafeed-2"
	# )

	# feed1.run()